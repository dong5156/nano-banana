"use client"

import { PricingTiers } from "@/components/pricing-tiers"
import { useI18n } from "@/components/i18n-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import React from "react"

export default function PricingPage() {
  // This page is a Client Component to reuse the i18n provider client hook for simplicity
  const { t } = useI18n()
  return (
    <main className="min-h-screen">
      <section className="container py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-4">{t("pricing.title")}</h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          {t("pricing.subtitle")}
        </p>
        <PricingBanner />
        <PricingTiers />
      </section>
    </main>
  )
}

function PricingBanner() {
  const { t } = useI18n()
  const [search, setSearch] = React.useState<{ error?: string; message?: string; status?: string }>({})
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const error = sp.get("error") || undefined
      const message = sp.get("message") || undefined
      const status = sp.get("status") || undefined
      setSearch({ error, message, status })
    } catch {}
  }, [])

  if (search.status === "success") {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <Alert>
          <AlertTitle>{t("pricing.notice.success_title")}</AlertTitle>
          <AlertDescription>
            {/* Could expand to show subscription details after webhook sync */}
            🎉
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (search.status === "cancelled") {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <Alert>
          <AlertTitle>{t("pricing.notice.cancelled_title")}</AlertTitle>
        </Alert>
      </div>
    )
  }

  if (search.error) {
    const key = search.error === "network" ? "pricing.error.network" : "pricing.error.checkout"
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <Alert variant="destructive">
          <AlertTitle>{t("pricing.notice.error_title")}</AlertTitle>
          <AlertDescription>
            {t(key)}
            {search.message ? ` (${decodeURIComponent(search.message)})` : null}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  return null
}
