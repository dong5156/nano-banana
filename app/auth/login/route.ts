import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  // Resolve origin early for error redirection
  const hdrs = await headers()
  const proto = hdrs.get("x-forwarded-proto") ?? "http"
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000"
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`

  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const next = searchParams.get("next") || ""

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
        queryParams: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    })

    if (error || !data?.url) {
      const msg = error?.message || "no_authorize_url"
      console.error("/auth/login signInWithOAuth error:", msg)
      return NextResponse.redirect(`${origin}/?error=auth_signin&message=${encodeURIComponent(msg)}`)
    }

    return NextResponse.redirect(data.url)
  } catch (e: any) {
    const msg = e?.message || "unexpected"
    console.error("/auth/login unexpected error:", msg)
    return NextResponse.redirect(`${origin}/?error=auth_signin&message=${encodeURIComponent(msg)}`)
  }
}
