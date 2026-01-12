import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    const { id, email, user_metadata } = data.user
    return NextResponse.json({ user: { id, email, user_metadata } }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
