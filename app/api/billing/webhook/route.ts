import { headers } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

function getEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function verifySignature(raw: string, sigHeader: string | null, secret: string) {
  if (!sigHeader) return false
  // Support plain HMAC signature or Stripe-like format: t=...,v1=...
  let signature = sigHeader
  const parts = sigHeader.split(",")
  const v1 = parts.find((p) => p.trim().startsWith("v1="))
  if (v1) signature = v1.split("=")[1]
  const expected = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

async function upsertSubscription(row: any) {
  const supabase = getSupabaseAdmin()
  // Upsert by unique creem_subscription_id if available; otherwise by user_id+plan
  const hasSubId = !!row.creem_subscription_id
  if (hasSubId) {
    return supabase.from("user_subscriptions").upsert(row, { onConflict: "creem_subscription_id" })
  }
  return supabase
    .from("user_subscriptions")
    .upsert(row, { onConflict: "user_id,plan" as any })
}

export async function POST(req: Request) {
  const raw = await req.text()
  const sig = (await headers()).get("creem-signature") || (await headers()).get("x-creem-signature")
  let ok = true
  try {
    const secret = getEnv("CREEM_WEBHOOK_SECRET")
    ok = verifySignature(raw, sig, secret)
  } catch (e) {
    // If secret missing, treat as disabled in local dev
    ok = false
  }
  if (!ok) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
  }

  let evt: any
  try {
    evt = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  // Extract common fields
  const type: string = evt.type || evt.event || evt.action || "unknown"
  const data: any = evt.data || evt.object || evt

  // Normalize payload
  const metadata = data.metadata || {}
  const user_id = metadata.user_id || data.user_id || null
  const email = metadata.email || data.email || data.customer_email || null
  const plan = metadata.plan || data.plan || null
  const creem_customer_id = data.customer || data.customer_id || null
  const creem_subscription_id = data.subscription || data.subscription_id || null
  const status = data.status || data.subscription_status || null
  const current_period_end = data.current_period_end || null

  // Map event types to status updates
  const intent = (() => {
    const t = type.toLowerCase()
    if (t.includes("completed") || t.includes("success")) return "completed"
    if (t.includes("created")) return "created"
    if (t.includes("updated")) return "updated"
    if (t.includes("canceled") || t.includes("cancelled")) return "canceled"
    return "unknown"
  })()

  const row = {
    user_id,
    email,
    plan,
    status: status || intent,
    creem_customer_id,
    creem_subscription_id,
    current_period_end,
    metadata,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  try {
    const { error } = await upsertSubscription(row)
    if (error) {
      console.error("webhook upsert error:", error.message)
      return NextResponse.json({ received: true, stored: false }, { status: 200 })
    }
  } catch (e: any) {
    console.error("webhook exception:", e?.message || e)
    return NextResponse.json({ received: true, stored: false }, { status: 200 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

