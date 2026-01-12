import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST() {
  const hdrs = await headers()
  const proto = hdrs.get("x-forwarded-proto") ?? "http"
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000"
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch (e: any) {
    console.error("/auth/logout error:", e?.message || e)
  }

  return NextResponse.redirect(`${origin}`)
}

// Allow a GET for convenience (link click)
export async function GET() {
  return POST()
}
