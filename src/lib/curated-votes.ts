import { createClient } from "@/lib/supabase/server";

type CuratedVoteRow = { sample_id: string; my_vote: number | null; upvotes: number | string };

export async function getCuratedVoteState(): Promise<{ votes: Record<string, number>; upvotes: Record<string, number>; error: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_curated_meme_votes");
  const votes: Record<string, number> = {};
  const upvotes: Record<string, number> = {};
  for (const row of (data ?? []) as unknown as CuratedVoteRow[]) {
    if (row.my_vote === 1 || row.my_vote === -1) votes[row.sample_id] = row.my_vote;
    upvotes[row.sample_id] = Number(row.upvotes);
  }
  return { votes, upvotes, error: Boolean(error) };
}
