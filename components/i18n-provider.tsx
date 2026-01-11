"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Locale = "en" | "zh"

type Dict = Record<string, Record<Locale, string>>

// Minimal dictionary; extend as needed
const dict: Dict = {
  "nav.editor": { en: "Editor", zh: "编辑器" },
  "nav.examples": { en: "Examples", zh: "示例" },
  "nav.reviews": { en: "Reviews", zh: "评价" },
  "nav.faq": { en: "FAQ", zh: "常见问题" },
  "cta.signin": { en: "Sign In", zh: "登录" },
  "cta.start": { en: "Start Editing", zh: "开始编辑" },
  // Language option labels should be self-referential (English/中文) regardless of current UI language
  "lang.en": { en: "English", zh: "English" },
  "lang.zh": { en: "中文", zh: "中文" },
  "lang.label": { en: "Language", zh: "语言" },

  // Meta
  "meta.title": { en: "Nano Banana - AI Image Editor | Edit Photos with Text", zh: "Nano Banana - AI 图像编辑器 | 文字即改图" },
  "meta.description": {
    en: "Transform any image with simple text prompts. Nano Banana's advanced AI model delivers consistent character editing and scene preservation.",
    zh: "用简单的文字提示即可编辑任意图片。Nano Banana 的先进 AI 模型在角色一致性与场景保真方面表现出色。",
  },

  // Hero
  "hero.badge": { en: "The AI model that outperforms Flux Kontext", zh: "性能超越 Flux Kontext 的 AI 模型" },
  "hero.title": { en: "Nano Banana", zh: "Nano Banana" },
  "hero.subtitle": {
    en: "Transform any image with simple text prompts. Nano Banana's advanced model delivers consistent character editing and scene preservation.",
    zh: "用简单的文字提示即可编辑任意图片。Nano Banana 的先进模型在角色一致性和场景保真方面表现出色。",
  },
  "hero.primary": { en: "Start Editing", zh: "开始编辑" },
  "hero.secondary": { en: "View Examples", zh: "查看示例" },
  "hero.bullet.1": { en: "One-shot editing", zh: "一键编辑" },
  "hero.bullet.2": { en: "Multi-image support", zh: "多图支持" },
  "hero.bullet.3": { en: "Natural language", zh: "自然语言" },

  // Editor section
  "editor.title": { en: "Get Started", zh: "快速上手" },
  "editor.subtitle": {
    en: "Experience the power of nano-banana's natural language image editing. Transform any photo with simple text commands.",
    zh: "体验 nano-banana 自然语言图像编辑的能力。用简单文本指令，轻松改造照片。",
  },
  "editor.upload.title": { en: "Upload Image", zh: "上传图片" },
  "editor.upload.change": { en: "Change", zh: "更换" },
  "editor.upload.cta": { en: "Add Image", zh: "添加图片" },
  "editor.upload.hint": { en: "Upload an image to begin", zh: "请先上传一张图片" },
  "editor.prompt.label": { en: "Main Prompt", zh: "主要提示词" },
  "editor.prompt.placeholder": {
    en: "Describe how you want to edit your image...",
    zh: "描述你希望如何编辑图片…",
  },
  "editor.generate": { en: "Generate Now", zh: "开始生成" },
  "editor.generating": { en: "Generating...", zh: "生成中…" },
  "editor.output.title": { en: "Output Gallery", zh: "生成结果" },
  "editor.output.ready.title": { en: "Ready for instant generation", zh: "就绪，立即生成" },
  "editor.output.ready.desc": {
    en: "Upload an image and enter your prompt to unleash the power",
    zh: "上传图片并输入提示词，释放强大能力",
  },
  "editor.output.footnote": {
    en: "Your ultra-fast AI creations appear here instantly",
    zh: "你的极速 AI 作品将即时呈现于此",
  },
  "editor.output.b1": { en: "• One-shot editing perfection", zh: "• 一次成片的编辑体验" },
  "editor.output.b2": { en: "• Character consistency maintained", zh: "• 角色一致性保持" },
  "editor.output.b3": { en: "• Seamless scene preservation", zh: "• 场景自然融合" },
  "editor.error.noimage": { en: "Please upload an image first.", zh: "请先上传图片。" },
  "editor.error.noprompt": { en: "Please enter a prompt.", zh: "请输入提示词。" },
  "editor.noimage.card.title": { en: "No image generated", zh: "未生成图片" },
  "editor.noimage.card.desc": {
    en: "Possible causes: model does not return images, insufficient credits/permissions, or provider outage.",
    zh: "可能原因：模型不产出图片、额度/权限不足，或服务异常。",
  },

  // Features
  "features.title": { en: "Core Features", zh: "核心特性" },
  "features.subtitle": { en: "Why Choose Nano Banana?", zh: "为什么选择 Nano Banana？" },
  "features.desc": {
    en: "Nano-banana is the most advanced AI image editor on LMArena. Revolutionize your photo editing with natural language understanding.",
    zh: "Nano-banana 是 LMArena 上最先进的 AI 图像编辑器，用自然语言革新你的修图体验。",
  },
  "feature.1.title": { en: "Natural Language Editing", zh: "自然语言编辑" },
  "feature.1.desc": {
    en: "Edit images using simple text prompts. Nano-banana AI understands complex instructions like GPT for images.",
    zh: "用简单文本提示编辑图片，Nano-banana 能理解复杂指令。",
  },
  "feature.2.title": { en: "Character Consistency", zh: "角色一致性" },
  "feature.2.desc": {
    en: "Maintain perfect character details across edits. This model excels at preserving faces and identities.",
    zh: "跨多次编辑保持人物细节与身份一致性。",
  },
  "feature.3.title": { en: "Scene Preservation", zh: "场景保真" },
  "feature.3.desc": {
    en: "Seamlessly blend edits with original backgrounds. Superior scene fusion compared to Flux Kontext.",
    zh: "与原背景自然融合，场景过渡更出色。",
  },
  "feature.4.title": { en: "One-Shot Editing", zh: "一键成片" },
  "feature.4.desc": {
    en: "Perfect results in a single attempt. Nano-banana solves one-shot image editing challenges effortlessly.",
    zh: "一次生成达到理想效果，轻松解决一键编辑难题。",
  },
  "feature.5.title": { en: "Multi-Image Context", zh: "多图上下文" },
  "feature.5.desc": {
    en: "Process multiple images simultaneously. Support for advanced multi-image editing workflows.",
    zh: "同时处理多张图片，支持高级多图工作流。",
  },
  "feature.6.title": { en: "AI UGC Creation", zh: "AI UGC 产出" },
  "feature.6.desc": {
    en: "Create consistent AI influencers and UGC content. Perfect for social media and marketing campaigns.",
    zh: "打造一致风格的 AI 虚拟人和 UGC 内容，适合社媒与营销。",
  },

  // Reviews
  "reviews.title": { en: "User Reviews", zh: "用户评价" },
  "reviews.subtitle": { en: "What creators are saying", zh: "创作者怎么说" },
  "reviews.role.creator": { en: "Digital Creator", zh: "数字创作者" },
  "reviews.role.ugc": { en: "UGC Specialist", zh: "UGC 专家" },
  "reviews.role.pro": { en: "Professional Editor", zh: "专业修图师" },
  "review.1": {
    en: "This editor completely changed my workflow. The character consistency is incredible - miles ahead of Flux Kontext!",
    zh: "这个编辑器完全改变了我的流程。角色一致性惊人——远胜于 Flux Kontext！",
  },
  "review.2": {
    en: "Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!",
    zh: "打造一致风格的 AI 虚拟人从未如此简单。多次编辑也能保持面部细节！",
  },
  "review.3": {
    en: "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!",
    zh: "有了它，一键编辑基本被攻克。场景融合既自然又真实！",
  },

  // FAQ
  "faq.title": { en: "FAQs", zh: "常见问题" },
  "faq.subtitle": { en: "Frequently Asked Questions", zh: "常见问题解答" },
  "faq.q1": { en: "What is Nano Banana?", zh: "什么是 Nano Banana？" },
  "faq.a1": {
    en: "It's a revolutionary AI image editing model that transforms photos using natural language prompts. This is currently the most powerful image editing model available, with exceptional consistency. It offers superior performance compared to Flux Kontext for consistent character editing and scene preservation.",
    zh: "这是一款革命性的 AI 图像编辑模型，使用自然语言提示即可改造照片。目前它是最强大的图像编辑模型之一，在一致性方面尤为出色。相较于 Flux Kontext，它在角色一致性与场景保真上表现更佳。",
  },
  "faq.q2": { en: "How does it work?", zh: "它是如何工作的？" },
  "faq.a2": {
    en: "Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions like 'place the creature in a snowy mountain' or 'imagine the whole face and create it'. It processes your text prompt and generates perfectly edited images.",
    zh: "只需上传图片并用自然语言描述你想要的修改。AI 能理解诸如“把角色放在雪山上”或“想象完整面部并生成”等复杂指令，并据此生成理想的编辑结果。",
  },
  "faq.q3": { en: "How is it better than Flux Kontext?", zh: "它为何优于 Flux Kontext？" },
  "faq.a3": {
    en: "This model excels in character consistency, scene blending, and one-shot editing. Users report it 'completely destroys' Flux Kontext in preserving facial features and seamlessly integrating edits with backgrounds. It also supports multi-image context, making it ideal for creating consistent AI influencers.",
    zh: "该模型在角色一致性、场景融合和一键编辑方面表现突出。许多用户反馈它在保持面部特征、与背景自然融合方面“完全碾压”Flux Kontext。同时支持多图上下文，适合打造一致风格的 AI 虚拟人。",
  },
  "faq.q4": { en: "Can I use it for commercial projects?", zh: "能用于商业项目吗？" },
  "faq.a4": {
    en: "Yes! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. Many users leverage it for creating consistent AI influencers and product photography. The high-quality outputs are suitable for professional use.",
    zh: "可以！它非常适合生成 AI UGC 内容、社媒活动与营销素材。很多用户用它来制作一致风格的 AI 虚拟人与产品图像，画质足以满足专业用途。",
  },
  "faq.q5": { en: "What types of edits can it handle?", zh: "支持哪些类型的编辑？" },
  "faq.a5": {
    en: "The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications. It excels at understanding contextual instructions like 'place in a blizzard' or 'create the whole face' while maintaining photorealistic quality.",
    zh: "该编辑器支持复杂编辑：面部补全、背景替换、物体放置、风格迁移、角色修改等。它擅长理解“置于暴风雪场景”“补全整张脸”等上下文指令，并保持照片级真实感。",
  },
  "faq.q6": { en: "Where can I try Nano Banana?", zh: "哪里可以体验 Nano Banana？" },
  "faq.a6": {
    en: "You can try nano-banana on LMArena or through our web interface. Simply upload your image, enter a text prompt describing your desired edits, and watch as nano-banana AI transforms your photo with incredible accuracy and consistency.",
    zh: "你可以在 LMArena 或我们的网页端体验 nano-banana。上传图片、输入提示词，即可看到 AI 以惊人的准确性与一致性完成编辑。",
  },

  // Showcase
  "showcase.title": { en: "Showcase", zh: "案例展示" },
  "showcase.subtitle": { en: "Lightning-Fast AI Creations", zh: "极速 AI 作品" },
  "showcase.desc": { en: "See what Nano Banana generates in milliseconds", zh: "看看 Nano Banana 毫秒级生成的效果" },
  "showcase.badge": { en: "Nano Banana Speed", zh: "Nano Banana 速度" },
  "showcase.cta": { en: "Try Nano Banana Generator", zh: "试用 Nano Banana 生成器" },

  // Footer
  "footer.desc": {
    en: "Transform any image with simple text prompts using advanced AI technology.",
    zh: "用先进 AI 技术，通过简单文字提示改造任意图片。",
  },
  "footer.product": { en: "Product", zh: "产品" },
  "footer.resources": { en: "Resources", zh: "资源" },
  "footer.company": { en: "Company", zh: "公司" },
  "footer.editor": { en: "Editor", zh: "编辑器" },
  "footer.showcase": { en: "Showcase", zh: "案例" },
  "footer.pricing": { en: "Pricing", zh: "定价" },
  "footer.api": { en: "API", zh: "API" },
  "footer.docs": { en: "Documentation", zh: "文档" },
  "footer.faq": { en: "FAQ", zh: "常见问题" },
  "footer.tutorials": { en: "Tutorials", zh: "教程" },
  "footer.blog": { en: "Blog", zh: "博客" },
  "footer.about": { en: "About", zh: "关于" },
  "footer.contact": { en: "Contact", zh: "联系" },
  "footer.privacy": { en: "Privacy", zh: "隐私" },
  "footer.terms": { en: "Terms", zh: "条款" },
  "footer.copyright": { en: "© 2025 Nano Banana. All rights reserved.", zh: "© 2025 Nano Banana. 保留所有权利。" },
}

function translate(key: string, locale: Locale): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[locale] ?? entry.en
}

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")

  // Load persisted choice
  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null
      if (saved === "en" || saved === "zh") setLocale(saved)
    } catch {}
  }, [])

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem("locale", locale)
      // Also set <html lang> for accessibility/SEO
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale === "zh" ? "zh" : "en"
      }
      // Sync to cookie so SSR can pick it up in generateMetadata
      // 1 year expiry; SameSite=Lax; path=/ so it's available app-wide
      document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`
    } catch {}
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key: string) => translate(key, locale),
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
