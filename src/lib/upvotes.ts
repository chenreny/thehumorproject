import type { Caption } from "@/lib/captions";

export function upvoteCount(caption: Pick<Caption, "score" | "votes">, previousVote = 0, currentVote = previousVote): number {
  const savedUpvotes = (caption.votes + caption.score) / 2;
  const localChange = Number(currentVote === 1) - Number(previousVote === 1);
  return Math.max(0, Math.round(savedUpvotes + localChange));
}
