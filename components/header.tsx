"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

export function Header() {
  const { t, locale, setLocale } = useI18n()
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
          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            {t("cta.signin")}
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t("cta.start")}
          </Button>
        </div>
      </div>
    </header>
  )
}
