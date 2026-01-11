"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useI18n } from "@/components/i18n-provider"

const faqs = [
  {
    qKey: "faq.q1",
    aKey: "faq.a1",
  },
  {
    qKey: "faq.q2",
    aKey: "faq.a2",
  },
  {
    qKey: "faq.q3",
    aKey: "faq.a3",
  },
  {
    qKey: "faq.q4",
    aKey: "faq.a4",
  },
  {
    qKey: "faq.q5",
    aKey: "faq.a5",
  },
  {
    qKey: "faq.q6",
    aKey: "faq.a6",
  },
]

export function FAQ() {
  const { t } = useI18n()
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("faq.title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("faq.subtitle")}</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {t(faq.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {t(faq.aKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
