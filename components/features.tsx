"use client"

import { Wand2, Users, ImageIcon, Zap, Layers, Target } from "lucide-react"

import { Card } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

const features = [
  {
    icon: Wand2,
    titleKey: "feature.1.title",
    descKey: "feature.1.desc",
  },
  {
    icon: Users,
    titleKey: "feature.2.title",
    descKey: "feature.2.desc",
  },
  {
    icon: ImageIcon,
    titleKey: "feature.3.title",
    descKey: "feature.3.desc",
  },
  {
    icon: Zap,
    titleKey: "feature.4.title",
    descKey: "feature.4.desc",
  },
  {
    icon: Layers,
    titleKey: "feature.5.title",
    descKey: "feature.5.desc",
  },
  {
    icon: Target,
    titleKey: "feature.6.title",
    descKey: "feature.6.desc",
  },
]

export function Features() {
  const { t } = useI18n()
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("features.title")}</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">{t("features.subtitle")}</p>
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">{t("features.desc")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{t(feature.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
