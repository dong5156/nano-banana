import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const pro = !!process.env.CREEM_CHECKOUT_URL_PRO
  const business = !!process.env.CREEM_CHECKOUT_URL_BUSINESS
  const mode: "direct" | "api" | "unset" = pro || business
    ? "direct"
    : process.env.CREEM_API_KEY
    ? "api"
    : "unset"
  return NextResponse.json({
    mode,
    enabled: { pro, business },
  })
}

