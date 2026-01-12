import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  const hdrs = await headers()
  const proto = hdrs.get("x-forwarded-proto") ?? "http"
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000"
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next")

    if (code) {
      // Exchange the auth code for a session and set cookies server-side
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error("/auth/callback exchangeCodeForSession error:", error.message)
        return NextResponse.redirect(`${origin}/?error=auth_callback&message=${encodeURIComponent(error.message)}`)
      }
    } else {
      return NextResponse.redirect(`${origin}/?error=auth_callback&message=missing_code`)
    }

    // Redirect to original protected target if provided
    return NextResponse.redirect(next ? `${origin}${next}` : `${origin}`)
  } catch (e: any) {
    const msg = e?.message || "unexpected"
    console.error("/auth/callback unexpected error:", msg)
    return NextResponse.redirect(`${origin}/?error=auth_callback&message=${encodeURIComponent(msg)}`)
  }
}
