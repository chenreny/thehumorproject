import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/captions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response(null, { status: 401, headers });
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return new Response(null, { status: 404, headers });
  const { data: caption, error } = await supabase.from("captions").select("image_path").eq("id", id).single();
  if (error || !caption?.image_path) return new Response(null, { status: 404, headers });
  const { data: image, error: imageError } = await supabase.storage.from("meme-images").download(caption.image_path);
  if (imageError || !image) return new Response(null, { status: 502, headers });
  return new Response(image, { headers: { ...headers, "Content-Type": "image/jpeg" } });
}
