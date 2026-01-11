export type Locale = "en" | "zh"

const metaDict: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Nano Banana - AI Image Editor | Edit Photos with Text",
    description:
      "Transform any image with simple text prompts. Nano Banana's advanced AI model delivers consistent character editing and scene preservation.",
  },
  zh: {
    title: "Nano Banana - AI 图像编辑器 | 文字即改图",
    description:
      "用简单的文字提示即可编辑任意图片。Nano Banana 的先进 AI 模型在角色一致性与场景保真方面表现出色。",
  },
}

export function getMetaStrings(locale: Locale) {
  return metaDict[locale]
}

