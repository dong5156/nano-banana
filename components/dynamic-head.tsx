"use client"

import { useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"

// Client-only head manager that updates title/description based on current locale.
// This avoids exporting `metadata` from a client component while still supporting i18n.
export function DynamicHead() {
  const { t } = useI18n()

  useEffect(() => {
    // Update document title
    document.title = t("meta.title")

    // Ensure description meta exists and update it
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = t("meta.description")
  }, [t])

  return null
}

