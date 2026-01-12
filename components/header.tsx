"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"
import * as React from "react"
import { useRouter } from "next/navigation"

export function Header() {
  const { t, locale, setLocale } = useI18n()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(true)
  const [loggingOut, setLoggingOut] = React.useState(false)
  const router = useRouter()

  // Fetch current user from API so client can render login state
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/user", { cache: "no-store" })
        if (!res.ok) throw new Error("user fetch failed")
        const json = await res.json()
        if (!cancelled) setUserEmail(json?.user?.email ?? null)
      } catch {
        if (!cancelled) setUserEmail(null)
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])
  
  async function onLogout() {
    try {
      setLoggingOut(true)
      await fetch("/auth/logout", { method: "POST" })
      setUserEmail(null)
      router.replace("/")
      router.refresh()
    } catch (e) {
      // ignore
    } finally {
      setLoggingOut(false)
    }
  }
  // Go to server-side login route without Next prefetch, preserving #editor return
  const goLogin = React.useCallback(() => {
    const url = new URL("/auth/login", window.location.origin)
    url.searchParams.set("next", "/#editor")
    window.location.href = url.toString()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍌</span>
          <span className="text-xl font-bold text-foreground">Nano Banana</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#editor"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.editor")}
          </Link>
          <Link
            href="#showcase"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.examples")}
          </Link>
          <Link
            href="#reviews"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.reviews")}
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.faq")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <select
            aria-label={t("lang.label")}
            className="hidden sm:inline-flex h-9 rounded-md border bg-background px-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
          >
            <option value="en">{t("lang.en")}</option>
            <option value="zh">{t("lang.zh")}</option>
          </select>
          {checking ? (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent" disabled>
              {t("common.loading")}
            </Button>
          ) : (
            <>
              {userEmail ? (
                <>
                  <span className="hidden sm:inline text-sm text-muted-foreground">{userEmail}</span>
                  <Button onClick={onLogout} disabled={loggingOut} variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
                    {t("auth.logout")}
                  </Button>
                </>
              ) : (
                <Button onClick={goLogin} variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
                  {t("cta.signin")}
                </Button>
              )}
              {userEmail ? (
                <Link href="#editor">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t("cta.start")}
                  </Button>
                </Link>
              ) : (
                <Button onClick={goLogin} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("cta.start")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
