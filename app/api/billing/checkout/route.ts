import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

type PlanKey = "pro" | "business"

function getEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function POST(req: Request) {
  const hdrs = await headers()
  const proto = hdrs.get("x-forwarded-proto") ?? "http"
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000"
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

  try {
    const { plan } = (await req.json()) as { plan?: PlanKey }
    if (!plan || (plan !== "pro" && plan !== "business")) {
      return NextResponse.json({ message: "invalid_plan" }, { status: 400 })
    }

    // 0) If direct hosted checkout link is configured, return it immediately (no API call)
    const directUrl = plan === "pro" ? process.env.CREEM_CHECKOUT_URL_PRO : process.env.CREEM_CHECKOUT_URL_BUSINESS
    if (directUrl) {
      return NextResponse.json({ url: directUrl })
    }

    // Enrich checkout with current user context if available
    let user_id: string | undefined
    let email: string | undefined
    try {
      const supabase = await createSupabaseServerClient()
      const { data } = await supabase.auth.getUser()
      user_id = data.user?.id
      email = (data.user?.email || (data.user as any)?.user_metadata?.email) as string | undefined
    } catch {}

    // 1) If not using directUrl, call Creem API to create a session when keys are provided
    const CREEM_API_KEY = process.env.CREEM_API_KEY
    const PRICE_ID = plan === "pro" ? process.env.CREEM_PRICE_ID_PRO : process.env.CREEM_PRICE_ID_BUSINESS
    const CREEM_API_BASE = process.env.CREEM_API_BASE || "https://api.creem.io"

    if (!CREEM_API_KEY || !PRICE_ID) {
      return NextResponse.json({ message: "creem_not_configured" }, { status: 400 })
    }

    // Prepare payload(s) and endpoint fallbacks to tolerate minor API differences
    const payloadBase = {
      mode: "subscription",
      success_url: `${origin}/pricing?status=success`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      customer_email: email,
      metadata: { user_id, email, plan, app: "nano-banana" },
    }
    const payloads = [
      { ...payloadBase, price_id: PRICE_ID },
      { ...payloadBase, price: PRICE_ID },
    ]
    const endpoints = [
      `${CREEM_API_BASE}/v1/checkout/sessions`,
      `${CREEM_API_BASE}/checkout/sessions`,
    ]

    let lastStatus = 0
    let lastText = ""
    for (const url of endpoints) {
      for (const body of payloads) {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CREEM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const json = await res.json().catch(() => ({}))
          const checkoutUrl = json?.url || json?.checkout_url || json?.hosted_page_url
          if (checkoutUrl) return NextResponse.json({ url: checkoutUrl })
          // If ok but no url, continue trying next payload/endpoint
        } else {
          lastStatus = res.status
          lastText = await res.text().catch(() => "")
          console.error("Creem checkout error", { endpoint: url, status: res.status, body })
          // For 404s/400s, try next combination; for 401/403, break early
          if (res.status === 401 || res.status === 403) {
            return NextResponse.json({ message: `creem_error_${res.status}`, detail: lastText }, { status: 502 })
          }
        }
      }
    }

    return NextResponse.json({ message: `creem_error_${lastStatus || 500}`, detail: lastText }, { status: 502 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "unexpected" }, { status: 500 })
  }
}
