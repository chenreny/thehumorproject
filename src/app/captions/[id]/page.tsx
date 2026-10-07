import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getMyVotes, UUID_PATTERN } from "@/lib/captions";
import { SiteNav } from "@/components/site-nav";
import { CaptionCard } from "@/components/caption-card";

const loadCaption = cache(async (id: string) => UUID_PATTERN.test(id) ? getFeed("new", 0, id) : { captions: [], error: false });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { title: "Sign in · The Humor Project" };
  const { id } = await params;
  const { captions } = await loadCaption(id);
  const caption = captions[0];
  return { title: caption ? `${caption.setup} · The Humor Project` : "Meme · The Humor Project", description: caption?.punchline };
}

export default async function CaptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect(`/?next=${encodeURIComponent(`/captions/${id}`)}`);
  const feed = await loadCaption(id);
  if (!feed.error && !feed.captions[0]) notFound();
  const myVotes = user ? await getMyVotes([id]) : { votes: {}, error: false };
  return <main className="page-shell"><div className="page-width"><SiteNav signedIn={Boolean(user)} />
    <div className="mx-auto max-w-xl"><h1 className="mb-6 text-2xl font-semibold tracking-tight">Group-chat worthy?</h1>
      {feed.error ? <p role="alert">This meme couldn’t load. Please refresh to try again.</p> : <CaptionCard caption={feed.captions[0]} signedIn={Boolean(user)} myVote={myVotes.votes[id]} />}
      {myVotes.error && <p role="alert" className="mt-4">Your saved vote couldn’t load. Please refresh.</p>}
      <div className="mt-8 flex flex-wrap justify-between gap-5 text-sm font-semibold text-accent"><Link href="/" className="underline">← More memes</Link><Link href="/create" className="underline">Make your own →</Link></div>
    </div>
  </div></main>;
}
