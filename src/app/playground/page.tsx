import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CampusDiorama } from "@/components/campus-diorama";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getMyVotes } from "@/lib/captions";
import { getCuratedVoteState } from "@/lib/curated-votes";
import type { Caption } from "@/lib/captions";

export const metadata = { title: "Campus diorama · The Humor Project" };

export default async function PlaygroundPage({ searchParams }: { searchParams: Promise<{ view?: string | string[]; location?: string | string[] }> }) {
  await connection();
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const requestedLocation = Array.isArray(query.location) ? query.location[0] : query.location;
  const location = requestedLocation === "Campus" || requestedLocation === "Ktown" || requestedLocation === "EastVillage" ? requestedLocation : "all";
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const captions: Caption[] = [];
  if (user && !authError) {
    for (let page = 0; page < 20; page += 1) {
      const feed = await getFeed("new", page);
      captions.push(...feed.captions);
      if (feed.captions.length < 30) break;
    }
  }
  const myVotes = user && !authError ? await getMyVotes(captions.map((caption) => caption.id)) : { votes: {}, error: false };
  const sampleVotes = user && !authError ? await getCuratedVoteState() : { votes: {}, upvotes: {}, error: false };
  return <CampusDiorama initialFeed={view === "feed"} initialLocation={location} captions={captions} initialVotes={myVotes.votes} initialSampleVotes={sampleVotes.votes} initialSampleUpvotes={sampleVotes.upvotes} signedIn={Boolean(user && !authError)} />;
}
