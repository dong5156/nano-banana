"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

const reviews = [
  {
    name: "AIArtistPro",
    roleKey: "reviews.role.creator",
    contentKey: "review.1",
    rating: 5,
  },
  {
    name: "ContentCreator",
    roleKey: "reviews.role.ugc",
    contentKey: "review.2",
    rating: 5,
  },
  {
    name: "PhotoEditor",
    roleKey: "reviews.role.pro",
    contentKey: "review.3",
    rating: 5,
  },
]

export function Reviews() {
  const { t } = useI18n()
  return (
    <section id="reviews" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("reviews.title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("reviews.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">"{t(review.contentKey)}"</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{t(review.roleKey)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
