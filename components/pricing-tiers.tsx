"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

type PlanKey = "free" | "pro" | "business"

const baseTiers: Array<{
  key: PlanKey
  name: string
  price: string
  period?: string
  cta: string
  popular?: boolean
  features: string[]
}> = [
  {
    key: "free",
    name: "pricing.plan.free.name",
    price: "$0",
    period: "pricing.period.forever",
    cta: "pricing.cta.get_started",
    features: [
      "pricing.feature.free.1",
      "pricing.feature.free.2",
      "pricing.feature.free.3",
    ],
  },
  {
    key: "pro",
    name: "pricing.plan.pro.name",
    price: "$12",
    period: "pricing.period.month",
    cta: "pricing.cta.buy_pro",
    popular: true,
    features: [
      "pricing.feature.pro.1",
      "pricing.feature.pro.2",
      "pricing.feature.pro.3",
      "pricing.feature.pro.4",
    ],
  },
  {
    key: "business",
    name: "pricing.plan.business.name",
    price: "$39",
    period: "pricing.period.month",
    cta: "pricing.cta.buy_business",
    features: [
      "pricing.feature.business.1",
      "pricing.feature.business.2",
      "pricing.feature.business.3",
      "pricing.feature.business.4",
    ],
  },
]

export function PricingTiers() {
  const { t } = useI18n()
  const [loadingKey, setLoadingKey] = React.useState<PlanKey | null>(null)
  const [enabled, setEnabled] = React.useState<{ pro: boolean; business: boolean } | null>(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/billing/config", { cache: "no-store" })
        const json = await res.json()
        setEnabled(json?.enabled || { pro: true, business: true })
      } catch {
        setEnabled({ pro: true, business: true })
      }
    })()
  }, [])

  async function handleCheckout(plan: PlanKey) {
    if (plan === "free") {
      // Free plan: send users to editor/login
      window.location.href = "/#editor"
      return
    }
    try {
      setLoadingKey(plan)
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (res.redirected) {
        // In case NextResponse.redirect is used directly
        window.location.href = res.url
        return
      }
      const json = await res.json().catch(() => null)
      const url = json?.url || json?.checkout_url
      if (url) {
        window.location.href = url
      } else {
        // Fallback to pricing with error message
        const msg = encodeURIComponent(json?.message || "checkout_unavailable")
        window.location.href = `/pricing?error=checkout&message=${msg}`
      }
    } catch (e) {
      window.location.href = "/pricing?error=network"
    } finally {
      setLoadingKey(null)
    }
  }

  const tiers = baseTiers
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.key}
          className={`rounded-xl border p-6 bg-card text-card-foreground ${
            tier.popular ? "ring-2 ring-primary" : ""
          }`}
        >
          {tier.popular && (
            <div className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {t("pricing.popular")}
            </div>
          )}
          <h3 className="text-xl font-semibold mb-1">{t(tier.name as any)}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold">{tier.price}</span>
            {tier.period && <span className="text-muted-foreground ml-1">{t(tier.period as any)}</span>}
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground mb-6">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1">✓</span>
                <span>{t(f as any)}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            onClick={() => handleCheckout(tier.key)}
            disabled={!!loadingKey || (tier.key === "pro" && enabled && !enabled.pro) || (tier.key === "business" && enabled && !enabled.business)}
          >
            {loadingKey === tier.key
              ? t("common.loading")
              : (tier.key === "pro" && enabled && !enabled.pro) || (tier.key === "business" && enabled && !enabled.business)
              ? t("pricing.notice.cancelled_title")
              : t(tier.cta as any)}
          </Button>
        </div>
      ))}
    </div>
  )
}
