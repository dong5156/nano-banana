"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Sparkles, ImageIcon } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function EditorSection() {
  const { t } = useI18n()
  const [prompt, setPrompt] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outputs, setOutputs] = useState<string[]>([])
  // Fixed model selection (Gemini). Hide model choice to simplify UX.
  const defaultModel =
    (process.env.NEXT_PUBLIC_DEFAULT_IMAGE_MODEL as string) || "google/gemini-2.5-flash-image"
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

  const handleGenerate = async () => {
    setError(null)
    setOutputs([])
    if (!selectedImage) {
      setError(t("editor.error.noimage"))
      return
    }
    if (!prompt.trim()) {
      setError(t("editor.error.noprompt"))
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image: selectedImage, model: defaultModel }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Try to surface server hint for easier debugging
        const detail = data?.reason?.detail || data?.reason || ""
        const msg = [data?.error, data?.hint, detail].filter(Boolean).join(" — ")
        throw new Error(msg || "Generation failed")
      }
      const imgs: string[] = Array.isArray(data?.images) ? data.images : []
      const texts: string[] = Array.isArray(data?.texts) ? data.texts : []
      if (imgs.length === 0) {
        setError(
          texts?.[0] ||
            data?.reason?.detail ||
            data?.hint ||
            "No image returned by the API."
        )
      }
      setOutputs(imgs)
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="editor" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{t("editor.title")}</h2>
            <p className="text-lg text-muted-foreground text-balance">{t("editor.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                {t("editor.upload.title")}
              </h3>

              <div className="relative">
                {selectedImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      {t("editor.upload.change")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border bg-muted/50">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground mb-2">{t("editor.upload.hint")}</span>
                    <Button variant="secondary" onClick={handlePickImage}>{t("editor.upload.cta")}</Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("editor.prompt.label")}</label>
                <Textarea
                  placeholder={t("editor.prompt.placeholder")}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
              {/* Model selection removed for UX; defaulting to Gemini via env */}
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? t("editor.generating") : t("editor.generate")}
              </Button>
            </Card>

            {/* Output Section */}
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">{t("editor.output.title")}</h3>

              {outputs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {outputs.map((src, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border">
                      {/* returned image may be remote URL or data URL */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Output ${idx + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-lg border border-yellow-400/40 bg-yellow-50 text-yellow-800 p-4 text-sm">
                  <p className="font-medium mb-1">{t("editor.noimage.card.title")}</p>
                  <p className="opacity-90">{error}</p>
                  <p className="opacity-70 mt-2">{t("editor.noimage.card.desc")}</p>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center space-y-2 p-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium text-foreground">{t("editor.output.ready.title")}</p>
                    <p className="text-xs text-muted-foreground">{t("editor.output.ready.desc")}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t("editor.output.footnote")}</p>
                <ul className="space-y-1 pl-4">
                  <li>{t("editor.output.b1")}</li>
                  <li>{t("editor.output.b2")}</li>
                  <li>{t("editor.output.b3")}</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
