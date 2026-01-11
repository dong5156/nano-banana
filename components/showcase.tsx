"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

const showcaseItems = [
  {
    title: "Ultra-Fast Mountain Generation",
    description: "Created in 0.8 seconds with Nano Banana's optimized neural engine",
    image: "/dramatic-mountain-landscape-at-sunset-with-snow-pe.jpg",
  },
  {
    title: "Instant Garden Creation",
    description: "Complex scene rendered in milliseconds using Nano Banana technology",
    image: "/beautiful-zen-garden-with-cherry-blossoms-and-koi-.jpg",
  },
  {
    title: "Real-time Beach Synthesis",
    description: "Nano Banana delivers photorealistic results at lightning speed",
    image: "/tropical-beach-paradise-with-palm-trees-and-crysta.jpg",
  },
  {
    title: "Rapid Aurora Generation",
    description: "Advanced effects processed instantly with Nano Banana AI",
    image: "/northern-lights-aurora-borealis-over-snowy-landsca.jpg",
  },
]

export function Showcase() {
  const { t } = useI18n()
  return (
    <section id="showcase" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("showcase.title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("showcase.subtitle")}</p>
            <p className="text-sm text-muted-foreground">{t("showcase.desc")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {showcaseItems.map((item, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                    <Zap className="h-3 w-3" />
                    {t("showcase.badge")}
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t("showcase.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
