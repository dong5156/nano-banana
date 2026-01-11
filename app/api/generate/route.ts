// Proxy route to call OpenRouter's Gemini 2.5 Flash Image model.
// Accepts JSON: { prompt: string, image: string(data URL) }
// Returns: { images: string[] } where each item is a URL or data URL.

export const runtime = "nodejs";

type OutputImageContent = {
  type?: string;
  // OpenRouter unifies different providers; image can be a URL or base64
  image_url?: { url: string } | string;
  image_base64?: string;
  url?: string;
  text?: string;
};

export async function POST(req: Request) {
  try {
    const { prompt, image, model: modelOverride } = (await req.json()) as {
      prompt?: string;
      image?: string; // data URL preferred
      model?: string; // optional override
    };

    if (!prompt || !image) {
      return new Response(
        JSON.stringify({ error: "Missing 'prompt' or 'image'" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY is not set on the server" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const referer = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Model selection with optional per-request override and sensible default
    const primaryModel = (modelOverride?.trim() || process.env.OPENROUTER_IMAGE_MODEL || "stability-ai/stable-image-ultra").trim();
    const fallbackModels = Array.from(
      new Set(
        [
          primaryModel,
          // A couple of generally image-capable models as fallbacks
          "stability-ai/stable-image-ultra",
          "black-forest-labs/flux-1.1-pro",
        ].filter(Boolean)
      )
    );

    // Helper to call OpenRouter with different endpoint/payload variants
    async function callOpenRouter(modelName: string, variant: "chat-openai" | "responses-openrouter") {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Nano Banana",
      } as const;

      let url = "";
      let body: any;
      if (variant === "chat-openai") {
        url = "https://openrouter.ai/api/v1/chat/completions";
        body = {
          model: modelName,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: image } },
              ],
            },
          ],
        } as const;
      } else {
        // responses endpoint expects `input` not `messages` in most providers
        url = "https://openrouter.ai/api/v1/responses";
        body = {
          model: modelName,
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                { type: "input_image", image_url: image },
              ],
            },
          ],
        } as const;
      }

      const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      const text = await resp.text();
      let data: any = undefined;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      return { ok: resp.ok, status: resp.status, data } as const;
    }

    // Try primary model first (chat semantics), then responses endpoint, then fallbacks
    const attempts: Array<{ model: string; variant: "chat-openai" | "responses-openrouter" }> = [];
    for (const m of fallbackModels) {
      attempts.push({ model: m, variant: "chat-openai" });
      attempts.push({ model: m, variant: "responses-openrouter" });
    }

    let finalData: any = null;
    let finalImages: string[] = [];
    let finalTexts: string[] = [];
    let lastError: { status: number; body: any } | null = null;

    // Try attempts sequentially until images are found
    for (const { model, variant } of attempts) {
      const { ok, status, data } = await callOpenRouter(model, variant);

      if (!ok) {
        lastError = { status, body: data };
        continue;
      }

      // Extract images and short texts from this response
      const images: string[] = [];
      const texts: string[] = [];

    const pushUrl = (u?: string) => {
      if (typeof u !== "string") return;
      const s = u.trim();
      if (!s) return;
      images.push(s);
    };

    const pushB64 = (b64?: string) => {
      if (typeof b64 !== "string") return;
      const s = b64.trim();
      if (!s) return;
      // If already a data URL, use as-is; else prefix as png.
      if (s.startsWith("data:image")) pushUrl(s);
      else pushUrl(`data:image/png;base64,${s}`);
    };

    // Heuristics for string-looking image outputs
    const isHttpUrl = (s: string) => /^https?:\/\//i.test(s);
    const looksLikeB64 = (s: string) => /^(?:[A-Za-z0-9+/\n\r]+={0,2})$/.test(s) && s.length > 64;

    const extractFromAny = (node: unknown) => {
      if (!node) return;
      if (typeof node === "string") {
        if (node.startsWith("data:image")) return pushUrl(node);
        if (isHttpUrl(node)) return pushUrl(node);
        if (looksLikeB64(node)) return pushB64(node);
        // Also scan for first URL embedded in text
        const m = node.match(/https?:\/\/\S+/);
        if (m) pushUrl(m[0]);
        // keep short plain text snippets as diagnostics
        const plain = node.trim();
        if (plain && plain.length <= 400) texts.push(plain);
        return;
      }
      if (Array.isArray(node)) {
        for (const v of node) extractFromAny(v);
        return;
      }
      if (typeof node === "object") {
        const obj = node as Record<string, unknown>;
        // Common fields used by providers
        if (typeof obj.image_url === "string") pushUrl(obj.image_url);
        const iu = obj.image_url as any;
        if (iu && typeof iu.url === "string") pushUrl(iu.url);
        if (typeof obj.url === "string") pushUrl(obj.url);
        if (typeof obj.image === "string") {
          // could be data URL, http URL, or base64
          const s = obj.image as string;
          if (s.startsWith("data:image")) pushUrl(s);
          else if (isHttpUrl(s)) pushUrl(s);
          else pushB64(s);
        }
        if (typeof obj.image_base64 === "string") pushB64(obj.image_base64 as string);
        if (typeof (obj as any).b64_json === "string") pushB64((obj as any).b64_json as string);
        if (typeof (obj as any).base64 === "string") pushB64((obj as any).base64 as string);
        if (typeof (obj as any).text === "string") {
          const t = String((obj as any).text).trim();
          if (t && t.length <= 400) texts.push(t);
        }

        // Recurse into nested objects/arrays
        for (const k of Object.keys(obj)) {
          const v = obj[k];
          // Skip obviously large non-image fields if needed
          extractFromAny(v);
        }
      }
    };

      // Walk typical locations first for performance/priority, then full payload
      extractFromAny(data?.choices?.[0]?.message?.content);
      extractFromAny(data?.choices?.[0]?.message?.image_url);
      extractFromAny(data?.image_url);
      // OpenAI-style tool calls sometimes used for multimodal
      extractFromAny(data?.choices?.[0]?.message?.tool_calls);
      // Some providers put images under top-level output/images
      extractFromAny(data?.output);
      extractFromAny(data?.images);
      // Finally, recurse the entire response to catch unknown provider shapes
      extractFromAny(data);

      const deduped = Array.from(new Set(images));
      const textDedup = Array.from(new Set(texts));
      // eslint-disable-next-line no-console
      console.log(`[api/generate] try model=${model} variant=${variant} images=${deduped.length}`);

      if (deduped.length > 0) {
        finalData = data;
        finalImages = deduped;
        finalTexts = textDedup.slice(0, 3);
        break; // success
      }

      // Otherwise continue to next attempt
      lastError = { status, body: data };
    }

    if (finalImages.length === 0) {
      // try to infer reason for better UX
      const inferReason = (status?: number, body?: any) => {
        const s = status || 0;
        const blob = typeof body === "string" ? body : JSON.stringify(body || "");
        const lower = (blob || "").toLowerCase();
        if (s === 401) return { code: "auth", detail: "Authentication failed (401)." };
        if (s === 402 || /insufficient|quota|credit|payment required/.test(lower))
          return { code: "quota", detail: "Insufficient credits/quota (402)." };
        if (s === 403 || /not allowed|forbidden|permission/.test(lower))
          return { code: "permission", detail: "Permission denied (403)." };
        if (s === 404) return { code: "not_found", detail: "Model or endpoint not found (404)." };
        if (s === 429 || /rate limit|too many requests/.test(lower))
          return { code: "rate_limited", detail: "Rate limited (429)." };
        if (/does not support image|text-only|no image support/.test(lower))
          return { code: "unsupported", detail: "Model likely does not return images for this request." };
        return { code: "no_image", detail: "No image in provider response." };
      };

      const snippet = (() => {
        try {
          const s = JSON.stringify(lastError?.body ?? null);
          return s && s.length > 800 ? s.slice(0, 800) + "…" : s;
        } catch {
          return "<unstringifiable response>";
        }
      })();
      try {
        // eslint-disable-next-line no-console
        console.warn(`[api/generate] no-image; lastErrorStatus=${lastError?.status} preview=${snippet?.slice?.(0,200)}`);
      } catch {}
      return new Response(
        JSON.stringify({
          error: "No image found in model output",
          hint:
            "Tried multiple providers/endpoints. The current model may only return text or you may lack permissions/credits.",
          reason: inferReason(lastError?.status, lastError?.body),
          rawPreview: snippet,
          tried: attempts,
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ images: finalImages, texts: finalTexts, raw: finalData }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
