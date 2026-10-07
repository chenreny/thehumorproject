"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/captions";

export async function vote(captionId: string, value: number): Promise<{ error?: string }> {
  if (!UUID_PATTERN.test(captionId) || (value !== 1 && value !== -1)) return { error: "Choose a valid joke and vote." };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Please sign in to vote." };
  // INSERT creates the first vote. On conflict, change only value: ownership and
  // timestamps are immutable and repeated clicks cannot increase the count.
  const { error } = await supabase.from("caption_votes").insert({ caption_id: captionId, user_id: user.id, value });
  if (error?.code === "23505") {
    const { error: updateError } = await supabase.from("caption_votes").update({ value }).eq("caption_id", captionId).eq("user_id", user.id).select("value").single();
    if (updateError) return { error: "Your vote wasn't saved. Please try again." };
  } else if (error) return { error: "Your vote wasn't saved. Please try again." };
  revalidatePath("/");
  revalidatePath(`/captions/${captionId}`);
  return {};
}
