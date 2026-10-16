"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient, supabaseConfig } from "@/lib/supabase/server";
import { normalizeMemeImage } from "@/lib/meme-image";
import { imageFileError } from "@/lib/media";
import { SYSTEM_PROMPT, parseMemeCaption, topicLabel, validateScene } from "@/lib/generation";
import { getTemplate } from "@/lib/templates";

export type GenerationState = {
  message: string;
  captionId?: string;
  meme?: { setup: string; punchline: string; imageDescription: string };
};

async function generateMemeImage(scene: string, topic: string, apiKey: string): Promise<Buffer> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    cache: "no-store", signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
      prompt: `Create an original, natural-looking 3:2 photograph for a funny student meme about ${topic}. Show this scene: ${scene}. Make the visual moment immediately clear and expressive. Do not include text, captions, lettering, watermarks, logos, or recognizable copyrighted characters.`,
      size: "1536x1024", quality: "low", output_format: "jpeg", output_compression: 60,
    }),
  });
  if (!response.ok) throw new Error("Image generation failed");
  const payload = await response.json();
  const encoded = payload.data?.[0]?.b64_json;
  if (typeof encoded !== "string" || !encoded) throw new Error("No generated image returned");
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length) throw new Error("Generated image was empty");
  return bytes;
}

export async function generateCaption(_previous: GenerationState, formData: FormData): Promise<GenerationState> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { message: "Sign in to make a meme." };
  const input = validateScene(formData.get("prompt"), formData.get("topic"));
  if (!input) return { message: "Choose a topic and describe your scene in 10–500 characters." };
  const modelTopic = topicLabel(input.topic);
  const imageSource = formData.get("image_source");
  if (imageSource !== "provided" && imageSource !== "generated") return { message: "Choose a template, upload a photo, or generate an image." };
  const templateId = formData.get("template_id");
  const template = getTemplate(templateId);
  if (templateId && !template) return { message: "Choose a template from the gallery, upload a photo, or generate an image." };
  let file: File | null = formData.get("image") instanceof File ? formData.get("image") as File : null;
  if (imageSource === "generated" && (templateId || file?.size)) return { message: "Choose only one image source." };
  if (imageSource === "provided" && !template && !file) return { message: "Choose a template or upload a photo." };
  if (template) {
    try {
      const bytes = await readFile(path.join(process.cwd(), "public", template.file));
      const fileName = template.file.split("/").pop() ?? "meme-template.jpg";
      const contentType = fileName.endsWith(".webp") ? "image/webp" : "image/jpeg";
      file = new File([new Uint8Array(bytes)], fileName, { type: contentType });
    } catch { return { message: "That template couldn't load. Try another or upload a photo." }; }
  }
  if (imageSource === "provided") {
    const fileError = imageFileError(file);
    if (fileError || !file) return { message: fileError ?? "Choose a photo." };
  }
  const apiKey = process.env.OPENAI_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !serviceKey) return { message: "The meme generator is not connected yet. Please try again later." };
  let imageBytes: Buffer | undefined;
  if (imageSource === "provided" && file) {
    try { imageBytes = await normalizeMemeImage(file); }
    catch { return { message: "That image couldn't be opened. Use a still JPEG, PNG, or WebP under 3 MB and at least 64 pixels wide and tall." }; }
  }
  const model = process.env.OPENAI_MODEL || "gpt-6-luna";
  const admin = createSupabaseClient(supabaseConfig().url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: requestId, error: reserveError } = await admin.rpc("reserve_generation", {
    p_user_id: user.id, p_prompt: input.prompt, p_system_prompt: SYSTEM_PROMPT, p_topic: input.topic, p_model: model,
  });
  if (reserveError || !requestId) return { message: reserveError?.message.includes("GENERATION_LIMIT")
    ? "You've used your 10 generation attempts in the last 24 hours. Come back when your next slot opens."
    : "We couldn't start your generation. Please try again." };

  const imagePath = `${user.id}/${requestId}.jpg`;
  let captionId: string;
  let meme: GenerationState["meme"];
  try {
    if (imageSource === "generated") {
      const generatedBytes = await generateMemeImage(input.prompt, modelTopic, apiKey);
      imageBytes = await normalizeMemeImage(new File([new Uint8Array(generatedBytes)], "ai-generated.jpg", { type: "image/jpeg" }));
    }
    if (!imageBytes) throw new Error("Image unavailable");
    const { error: uploadError } = await admin.storage.from("meme-images").upload(imagePath, imageBytes, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw new Error("Image upload failed");
    const { error: imageError } = await admin.from("generation_requests").update({ image_path: imagePath, template_id: template?.id ?? null }).eq("id", requestId);
    if (imageError) throw new Error("Image reference save failed");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store", signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model, store: false, reasoning: { effort: "none" }, max_output_tokens: 400,
        instructions: SYSTEM_PROMPT,
        input: [{ role: "user", content: [
          { type: "input_text", text: `Topic: ${modelTopic}\nScene: ${input.prompt}` },
          { type: "input_image", image_url: `data:image/jpeg;base64,${imageBytes.toString("base64")}`, detail: "low" },
        ] }],
        text: { format: { type: "json_schema", name: "caption", strict: true, schema: {
          type: "object", additionalProperties: false,
          properties: { setup: { type: "string" }, punchline: { type: "string" }, image_description: { type: "string" } }, required: ["setup", "punchline", "image_description"],
        } } },
      }),
    });
    if (!response.ok) throw new Error("Provider unavailable");
    const payload = await response.json();
    if (payload.status !== "completed") throw new Error("Incomplete or blocked output");
    const text = payload.output?.filter((item: { type: string }) => item.type === "message")
      .flatMap((item: { content: { type: string; text?: string }[] }) => item.content)
      .filter((part: { type: string }) => part.type === "output_text")
      .map((part: { text?: string }) => part.text ?? "").join("");
    const caption = parseMemeCaption(text ?? "");
    meme = { setup: caption.setup, punchline: caption.punchline, imageDescription: caption.image_description };
    const { data, error } = await admin.rpc("complete_meme_generation", {
      p_request_id: requestId, p_setup: caption.setup, p_punchline: caption.punchline, p_image_description: caption.image_description,
    });
    if (error || !data) throw new Error("Save failed");
    captionId = data;
  } catch {
    const { data: failed } = await admin.from("generation_requests").update({ status: "failed" }).eq("id", requestId).eq("status", "pending").select("id");
    // Never delete an image if publication may already have committed.
    if (failed?.length) await admin.storage.from("meme-images").remove([imagePath]);
    revalidatePath("/create");
    return { message: "We couldn't finish that meme. Check your history before trying again. This attempt counts toward your daily limit." };
  }
  revalidatePath("/");
  revalidatePath("/create");
  return {
    message: "",
    captionId,
    meme,
  };
}
