"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Caption } from "@/lib/captions";
import { MemeImage } from "@/components/meme-image";
import { Icon } from "@/components/icon";
import { vote } from "@/app/vote-actions";
import { upvoteCount } from "@/lib/upvotes";

export function CaptionCard({ caption, signedIn, myVote = 0, featured = false }: { caption: Caption; signedIn: boolean; myVote?: number; featured?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [enlarged, setEnlarged] = useState(false);
  const [localVote, setLocalVote] = useState<number | null>(null);
  const enlargeDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = enlargeDialog.current;
    if (!element) return;
    if (enlarged && !element.open) element.showModal();
    else if (!enlarged && element.open) element.close();
  }, [enlarged]);
  function submit(value: number) {
    setError("");
    startTransition(async () => {
      try {
        const result = await vote(caption.id, value);
        setError(result.error ?? "");
        if (!result.error) setLocalVote(value);
      } catch { setError("Your vote wasn't saved. Please try again."); }
    });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/captions/${caption.id}`);
      setShareMessage("Link copied.");
    } catch { setShareMessage("Open the meme and copy its address to share."); }
  }
  const label = `${caption.setup} ${caption.punchline}`;
  const currentVote = localVote ?? myVote;
  const count = upvoteCount(caption, myVote, currentVote);
  return <article className={`caption-card flex h-full min-w-0 flex-col ${featured ? "caption-featured" : ""}`}>
    {caption.image_path ? <div className="overflow-hidden rounded-xl">
      <h2 className="sr-only">{caption.setup}</h2>
      {featured ? <button type="button" aria-label={`Enlarge meme: ${label}`} className="featured-image-button" onClick={() => setEnlarged(true)}><MemeImage variant="stage" src={caption.image_url} description={caption.image_description || "Uploaded meme photo"} top={caption.setup} bottom={caption.punchline} /></button>
        : <div className="block rounded-xl"><MemeImage variant="square" src={caption.image_url} description={caption.image_description || "Uploaded meme photo"} top={caption.setup} bottom={caption.punchline} /></div>}
    </div> : <div className={`text-only-meme ${featured ? "text-only-stage" : ""}`}>
      <h2>{caption.setup}</h2>
      <p>{caption.punchline}</p>
    </div>}
    <div className={`caption-actions mt-auto ${featured ? "caption-actions-featured" : ""}`}>
      {signedIn ? <div className="reaction-row" role="group" aria-label="Rate this meme" aria-busy={pending}>
        <button onClick={() => submit(1)} disabled={pending || currentVote === 1} aria-pressed={currentVote === 1} aria-label="Upvote meme" title="Upvote meme" className={`reaction-button reaction-vote-button ${currentVote === 1 ? "is-selected" : ""}`}><Icon name="thumb" /></button>
        <span className="reaction-count" aria-label={`${count} upvotes`}>{count}</span>
        <button onClick={() => submit(-1)} disabled={pending || currentVote === -1} aria-pressed={currentVote === -1} aria-label="Downvote meme" title="Downvote meme" className={`reaction-button reaction-vote-button reaction-vote-down ${currentVote === -1 ? "is-selected" : ""}`}><Icon name="thumb" /></button>
        <button onClick={share} className="reaction-button reaction-share"><Icon name="upload" /><span>Share</span><span aria-hidden="true">↗</span></button>
      </div> : <div className="reaction-row">
        <a href={`/auth/login?next=/captions/${caption.id}`} className="reaction-button"><span>Sign in to vote</span></a>
        <span className="reaction-count" aria-label={`${count} upvotes`}>{count}</span>
        <button onClick={share} className="reaction-button reaction-share"><Icon name="upload" /><span>Share</span><span aria-hidden="true">↗</span></button>
      </div>}
      {pending && <p role="status" className="action-feedback">Saving your vote…</p>}
      {error && <p role="alert" className="action-feedback action-error">{error}</p>}
      {shareMessage && <p role="status" className="action-feedback">{shareMessage}</p>}
      {signedIn && <p className="sr-only">One vote per meme. You can change your mind anytime.</p>}
    </div>
    {featured && caption.image_path && <dialog ref={enlargeDialog} className="meme-dialog" aria-labelledby={`enlarged-title-${caption.id}`} onClose={() => setEnlarged(false)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="meme-dialog-card"><div className="meme-dialog-heading"><h2 id={`enlarged-title-${caption.id}`}>Enlarged meme</h2><button type="button" aria-label="Close enlarged meme" onClick={() => enlargeDialog.current?.close()}>×</button></div><MemeImage variant="stage" src={caption.image_url} description={caption.image_description || "Uploaded meme photo"} top={caption.setup} bottom={caption.punchline} /><Link href={`/captions/${caption.id}`} className="meme-dialog-detail">Open meme page →</Link></div>
    </dialog>}
  </article>;
}
