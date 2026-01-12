import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { I18nProvider } from "@/components/i18n-provider"
import { DynamicHead } from "@/components/dynamic-head"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { getMetaStrings } from "@/lib/i18n-meta"

// Note: we avoid next/font in CI/offline builds to prevent network fetch during build.

// SSR metadata: read `locale` cookie and set title/description accordingly.
export async function generateMetadata(): Promise<Metadata> {
  // Read cookie header in a resilient way across runtimes (Turbopack dev quirks)
  let cookieHeader = ""
  try {
    // In Next 16+, `headers()` is a dynamic API that returns a Promise in some contexts.
    const anyHdrs: any = await headers()
    if (anyHdrs && typeof anyHdrs.get === "function") {
      cookieHeader = anyHdrs.get("cookie") || ""
    } else if (anyHdrs && typeof anyHdrs === "object") {
      cookieHeader = anyHdrs.cookie ?? anyHdrs["cookie"] ?? ""
    }
  } catch {}

  const isZh = String(cookieHeader)
    .split(";")
    .map((s) => s.trim())
    .some((kv) => kv.toLowerCase().startsWith("locale=") && kv.split("=")[1] === "zh")
  const locale = (isZh ? "zh" : "en") as "en" | "zh"
  const meta = getMetaStrings(locale)
  return {
    generator: "v0.app",
    icons: {
      icon: [
        { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
        { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-icon.png",
    },
    title: meta.title,
    description: meta.description,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <I18nProvider>
          {/* Client-side title/description updates for language switching */}
          <DynamicHead />
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  )
}
