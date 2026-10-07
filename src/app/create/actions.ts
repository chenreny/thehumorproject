"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient, supabaseConfig } from "@/lib/supabase/server";
import { normalizeMemeImage } from "@/lib/meme-image";
import { imageFileError } from "@/lib/media";
import { SYSTEM_PROMPT, parseMemeCaption, validateScene } from "@/lib/generation";
import { getTemplate } from "@/lib/templates";

export type GenerationState = { message: string; captionId?: string };

export async function generateCaption(_previous: GenerationState, formData: FormData): Promise<GenerationState> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { message: "Sign in to make a meme." };
  const input = validateScene(formData.get("prompt"), formData.get("topic"));
  if (!input) return { message: "Choose a topic and describe your scene in 10–500 characters." };
  const templateId = formData.get("template_id");
  const template = getTemplate(templateId);
  if (templateId && !template) return { message: "Choose a template from the gallery or upload a photo." };
  let file = formData.get("image");
  if (template) {
    try {
      const bytes = await readFile(path.join(process.cwd(), "public", "meme-templates", `${template.id}.jpg`));
      file = new File([new Uint8Array(bytes)], `${template.id}.jpg`, { type: "image/jpeg" });
    } catch { return { message: "That template couldn't load. Try another or upload a photo." }; }
  }
  const fileError = imageFileError(file instanceof File ? file : null);
  if (fileError || !(file instanceof File)) return { message: fileError ?? "Choose a photo." };
  const apiKey = process.env.OPENAI_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !serviceKey) return { message: "The meme generator is not connected yet. Please try again later." };
  let imageBytes: Buffer;
  try { imageBytes = await normalizeMemeImage(file); }
  catch { return { message: "That image couldn't be opened. Use a still JPEG, PNG, or WebP under 3 MB and at least 64 pixels wide and tall." }; }
  const model = process.env.OPENAI_MODEL || "gpt-6-luna";
  const admin = createSupabaseClient(supabaseConfig().url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: requestId, error: reserveError } = await admin.rpc("reserve_generation", {
    p_user_id: user.id, p_prompt: input.prompt, p_system_prompt: SYSTEM_PROMPT, p_topic: input.topic, p_model: model,
  });
  if (reserveError || !requestId) return { message: reserveError?.message.includes("GENERATION_LIMIT")
    ? "You've used your 5 generation attempts in the last 24 hours. Come back when your next slot opens."
    : "We couldn't start your generation. Please try again." };

  const imagePath = `${user.id}/${requestId}.jpg`;
  let captionId: string;
  try {
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
          { type: "input_text", text: `Topic: ${input.topic}\nScene: ${input.prompt}` },
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
  return { message: "Your meme is live! See how the group chat rates it.", captionId };
}
