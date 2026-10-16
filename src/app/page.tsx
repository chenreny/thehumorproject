import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getMyVotes, type Caption } from "@/lib/captions";
import { getCuratedVoteState } from "@/lib/curated-votes";
import { CampusDiorama } from "@/components/campus-diorama";
import { SignInScreen } from "@/components/sign-in-screen";
import { roomScene } from "@/lib/room-scenes";

type FeedLocation = "all" | "Campus" | "Ktown" | "EastVillage";

export default async function Home({ searchParams }: { searchParams: Promise<{ auth_error?: string | string[]; next?: string | string[]; view?: string | string[]; location?: string | string[]; scene?: string | string[] }> }) {
  await connection();
  const params = await searchParams;
  const single = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
  const requestedView = single(params.view);
  const legacyScene = roomScene(single(params.scene));
  const legacyBrowse = Boolean(legacyScene && !requestedView && !single(params.location));
  const view = legacyBrowse ? "feed" : requestedView;
  const legacyLocation = legacyScene?.id === "subway" ? "EastVillage" : "Campus";
  const requestedLocation = single(params.location) ?? (legacyBrowse ? legacyLocation : undefined);
  const location: FeedLocation = requestedLocation === "Campus" || requestedLocation === "Ktown" || requestedLocation === "EastVillage" ? requestedLocation : "all";
  const browseReturn = view === "feed" ? `/?view=feed${location === "all" ? "" : `&location=${location}`}` : "/";
  const next = single(params.next);
  const authErrorMessage = single(params.auth_error);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <SignInScreen next={next ?? browseReturn} authError={authErrorMessage} />;

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

  return <>
    {authErrorMessage && <p role="alert" className="room-alert">Sign in could not be completed. Please try again.</p>}
    <CampusDiorama initialFeed={view === "feed"} initialLocation={location} captions={captions} initialVotes={myVotes.votes} initialSampleVotes={sampleVotes.votes} initialSampleUpvotes={sampleVotes.upvotes} signedIn feedError={feedError} homeHref="/" />
  </>;
}
