import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getMyVotes, type Caption } from "@/lib/captions";
import { getCuratedVoteState } from "@/lib/curated-votes";
import { CampusDiorama } from "@/components/campus-diorama";
import { SignInScreen } from "@/components/sign-in-screen";

export const metadata = { title: "All memes · The Humor Project" };

type FeedLocation = "all" | "Campus" | "Ktown" | "EastVillage";

export default async function MemesPage({ searchParams }: { searchParams: Promise<{ location?: string | string[] }> }) {
  await connection();
  const params = await searchParams;
  const requestedLocation = Array.isArray(params.location) ? params.location[0] : params.location;
  const location: FeedLocation = requestedLocation === "Campus" || requestedLocation === "Ktown" || requestedLocation === "EastVillage" ? requestedLocation : "all";
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <SignInScreen next="/memes" />;

  const captions: Caption[] = [];
  let feedError = false;
  for (let page = 0; page < 20; page += 1) {
    const feed = await getFeed("new", page);
    captions.push(...feed.captions);
    feedError ||= feed.error;
    if (feed.captions.length < 30) break;
  }
  const myVotes = await getMyVotes(captions.map((caption) => caption.id));
  const sampleVotes = await getCuratedVoteState();

  return <CampusDiorama initialFeed initialLocation={location} captions={captions} initialVotes={myVotes.votes} initialSampleVotes={sampleVotes.votes} initialSampleUpvotes={sampleVotes.upvotes} signedIn feedError={feedError} homeHref="/" standaloneFeed />;
}
