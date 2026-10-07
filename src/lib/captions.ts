import { createClient } from "@/lib/supabase/server";

export type Caption = {
  id: string;
  setup: string;
  punchline: string;
  topic: string;
  created_at: string;
  score: number;
  votes: number;
  image_path: string | null;
  image_description: string | null;
  image_url?: string;
};

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getFeed(sort = "new", page = 0, id?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("caption_feed", { p_sort: sort, p_offset: page * 30, p_id: id ?? null });
  const captions = (data ?? []) as Caption[];
  // Serve images through an authenticated route, rather than shareable signed URLs.
  captions.forEach((caption) => {
    if (caption.image_path) caption.image_url = `/captions/${caption.id}/image`;
  });
  return { captions, error: Boolean(error) };
}

export async function getMyVotes(ids: string[]): Promise<{ votes: Record<string, number>; error: boolean }> {
  if (!ids.length) return { votes: {}, error: false };
  const supabase = await createClient();
  const { data, error } = await supabase.from("caption_votes").select("caption_id, value").in("caption_id", ids);
  return { votes: Object.fromEntries((data ?? []).map((v) => [v.caption_id, v.value])), error: Boolean(error) };
}
