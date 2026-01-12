"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"

export function Hero() {
  const { t } = useI18n()
  const [isAuthed, setIsAuthed] = React.useState<boolean>(false)
  const router = useRouter()

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/user", { cache: "no-store" })
        const json = await res.json()
        if (!cancelled) setIsAuthed(!!json?.user)
      } catch {
        if (!cancelled) setIsAuthed(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Avoid Next.js prefetch hitting /auth/login (which 302s to Google and can cause dev overlay "Failed to fetch")
  const goLogin = React.useCallback(() => {
    const url = new URL("/auth/login", window.location.origin)
    url.searchParams.set("next", "/#editor")
    window.location.href = url.toString()
  }, [])
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Decorative banana elements */}
      <div className="absolute top-20 right-10 text-6xl opacity-10 rotate-12">🍌</div>
      <div className="absolute bottom-20 left-10 text-8xl opacity-5 -rotate-12">🍌</div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground">
            <span className="text-xl">🍌</span>
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">{t("hero.title")}</h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">{t("hero.subtitle")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthed ? (
              <Link href="#editor">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                  {t("hero.primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={goLogin} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                {t("hero.primary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              {t("hero.secondary")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{t("hero.bullet.1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{t("hero.bullet.2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{t("hero.bullet.3")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
