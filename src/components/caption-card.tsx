"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Caption } from "@/lib/captions";
import { MemeImage } from "@/components/meme-image";
import { Icon } from "@/components/icon";
import { vote } from "@/app/vote-actions";

export function CaptionCard({ caption, signedIn, myVote = 0 }: { caption: Caption; signedIn: boolean; myVote?: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  function submit(value: number) {
    setError("");
    startTransition(async () => {
      try {
        const result = await vote(caption.id, value);
        setError(result.error ?? "");
      } catch { setError("Your vote wasn't saved. Please try again."); }
    });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/captions/${caption.id}`);
      setShareMessage("Link copied!");
    } catch { setShareMessage("Open the meme and copy its address to share."); }
  }
  return (
    <article className="flex h-full min-w-0 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-accent"><span className="font-medium text-accent">{caption.topic}</span><span>AI caption</span></div>
      {caption.image_path ? <div className="overflow-hidden rounded-2xl">
        <h2 className="sr-only">{caption.setup}</h2>
        <Link href={`/captions/${caption.id}`} aria-label={`Open meme: ${caption.setup}`} className="block rounded-2xl">
          <MemeImage src={caption.image_url} description={caption.image_description || "Uploaded meme photo"} top={caption.setup} bottom={caption.punchline} />
        </Link>
      </div> : <><h2 className="rounded-t-2xl bg-white px-6 pt-6 text-2xl font-normal leading-snug tracking-tight"><Link href={`/captions/${caption.id}`}>{caption.setup}</Link></h2><p className="mb-2 rounded-b-2xl bg-white px-6 pb-8 pt-4 leading-relaxed text-accent">{caption.punchline}</p></>}
      <div className="mt-auto px-1 pb-1 pt-4">
        <p className="mb-3 text-[11px] text-accent" aria-live="polite">{caption.score > 0 ? "+" : ""}{caption.score} score · {caption.votes} {Number(caption.votes) === 1 ? "vote" : "votes"}{signedIn && myVote !== 0 ? " · Your vote is saved" : ""}</p>
        {signedIn ? <div className="flex flex-wrap gap-2" aria-label="Rate this meme" aria-busy={pending}>
          <button onClick={() => submit(1)} disabled={pending || myVote === 1} aria-pressed={myVote === 1} aria-label="↑ Funny" className={`flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${myVote === 1 ? "border-accent-border-strong bg-accent-selected text-accent" : "border-accent-border text-accent hover:bg-white"}`}><span aria-hidden="true">↑</span>Funny +1</button>
          <button onClick={() => submit(-1)} disabled={pending || myVote === -1} aria-pressed={myVote === -1} aria-label="↓ Not quite" className={`flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${myVote === -1 ? "border-accent-border-strong bg-accent-selected text-accent" : "border-accent-border text-accent hover:bg-white"}`}><span aria-hidden="true">↓</span>Not quite −1</button>
          <button onClick={share} className="ml-auto flex min-h-10 items-center gap-1.5 px-1 text-xs font-medium text-accent hover:text-foreground">Share<Icon name="arrow" className="!size-3" /></button>
        </div> : <div className="flex min-h-10 items-center justify-between gap-3 text-xs font-medium text-accent"><a href={`/auth/login?next=/captions/${caption.id}`} className="underline underline-offset-4">Sign in to rate</a><button onClick={share} className="underline underline-offset-4">Share</button></div>}
        {pending && <p role="status" className="mt-3 text-sm text-accent">Saving your vote…</p>}
        {error && <p role="alert" className="mt-3 text-sm font-bold text-accent-strong">{error}</p>}
        {shareMessage && <p role="status" className="mt-3 text-sm text-accent">{shareMessage}</p>}
      </div>
    </article>
  );
}
