import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// Server-side Supabase client bound to Next.js cookies
// Note: In Next 16, cookies() may be a dynamic API returning a Promise.
// We await it once here and provide synchronous cookie accessors to Supabase.
export async function createSupabaseServerClient() {
  const cookieStore: any = await cookies()
  return createServerClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          const c = cookieStore.get?.(name)
          return typeof c === "string" ? c : c?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set?.({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Delete cookie by setting maxAge to 0; aligns with Supabase SSR docs
          cookieStore.set?.({ name, value: "", ...options, maxAge: 0 })
        },
      },
    }
  )
}
