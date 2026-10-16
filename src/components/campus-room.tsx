"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Caption } from "@/lib/captions";
import { LEGACY_TOPICS, TOPICS, topicLabel } from "@/lib/generation";
import { CaptionCard } from "@/components/caption-card";
import { SiteNav } from "@/components/site-nav";
import { Icon } from "@/components/icon";
import { RoomExplorer } from "@/components/room-explorer";
import { RoomDestinationRail } from "@/components/room-destination-rail";
import { roomScene, type RoomSceneId } from "@/lib/room-scenes";

type Topic = (typeof TOPICS)[number];
const TOPIC_FILTERS = ["All loaded", ...TOPICS, ...LEGACY_TOPICS] as const;
type TopicFilter = (typeof TOPIC_FILTERS)[number];

export function CampusRoom({ captions, votes, sort, page, dailyPrompt, initialScene, feedError = false, votesError = false }: {
  captions: Caption[];
  votes: Record<string, number>;
  sort: "new" | "week";
  page: number;
  dailyPrompt: string;
  initialScene?: RoomSceneId | null;
  feedError?: boolean;
  votesError?: boolean;
}) {
  const [topic, setTopic] = useState<TopicFilter>(initialScene ? roomScene(initialScene)?.topic ?? "All loaded" : "All loaded");
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(captions[0]?.id ?? null);
  const [dialog, setDialog] = useState<"channels" | null>(null);
  const [manualExploring, setManualExploring] = useState(false);
  const [dismissedRouteScene, setDismissedRouteScene] = useState<RoomSceneId | null>(null);
  const [lastRouteScene, setLastRouteScene] = useState(initialScene);
  if (initialScene !== lastRouteScene) {
    setLastRouteScene(initialScene);
    setDismissedRouteScene(null);
    if (!initialScene) setManualExploring(false);
  }
  const exploring = Boolean(initialScene && dismissedRouteScene !== initialScene) || manualExploring;
  const [sceneRequest, setSceneRequest] = useState<{ scene: RoomSceneId; token: number } | null>(null);
  const exploreTriggerRef = useRef<HTMLButtonElement>(null);
  const returnFeedRef = useRef({ topic, selectedId });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filtered = useMemo(() => topic === "All loaded" ? captions : captions.filter((caption) => caption.topic === topic), [captions, topic]);
  const selected = filtered.find((caption) => caption.id === selectedId) ?? filtered[0];
  const upNext = filtered.filter((caption) => caption.id !== selected?.id).slice(0, 3);
  const promptTopic: Topic = topic === "Ktown" || topic === "EastVillage" ? topic : "Campus";
  const promptHref = `/create?${new URLSearchParams({ topic: promptTopic, prompt: dailyPrompt }).toString()}`;
  const roomHref = `/?sort=${sort}&page=${page}`;

  function enterExplorer() {
    returnFeedRef.current = { topic, selectedId };
    setManualExploring(true);
  }

  function enterDestination(scene: RoomSceneId) {
    setSceneRequest((current) => ({ scene, token: (current?.token ?? 0) + 1 }));
    enterExplorer();
  }

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (dialog && !element.open) element.showModal();
    else if (!dialog && element.open) element.close();
  }, [dialog]);

  return <>
    <SiteNav signedIn active="feed" onRadioClick={() => setDialog("channels")} />
    <dialog ref={dialogRef} className="room-dialog" aria-labelledby="room-dialog-title" onClose={() => setDialog(null)} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="room-dialog-card">
        <div className="room-dialog-heading"><div><p className="room-kicker">CAMPUS AFTER HOURS</p><h2 id="room-dialog-title">Tune the channel</h2></div><button type="button" className="dialog-close" aria-label="Close dialog" onClick={() => dialogRef.current?.close()}>×</button></div>
        <p className="dialog-intro">Choose a topic to filter the memes loaded on this page.</p><fieldset className="dialog-channels"><legend className="sr-only">Filter the loaded feed by topic</legend>{TOPIC_FILTERS.map((item) => <label key={item} className={`dialog-channel ${topic === item ? "is-active" : ""}`}><input type="radio" name="channel" value={item} checked={topic === item} onChange={() => { setTopic(item); const first = item === "All loaded" ? captions[0] : captions.find((caption) => caption.topic === item); setSelectedId(first?.id ?? null); dialogRef.current?.close(); }} /><span>{item === "All loaded" ? item : topicLabel(item)}</span>{topic === item && <span className="dialog-check" aria-hidden="true">✓</span>}</label>)}</fieldset>
      </div>
    </dialog>

    {votesError && <p role="alert" className="room-alert">We couldn’t load your saved votes. Refresh before voting again.</p>}
    {feedError ? <div className="room-empty" role="alert"><h2>The channel went quiet.</h2><p>The feed couldn’t load. Try refreshing to tune back in.</p><Link href="/" className="text-link">Try again <Icon name="arrow" /></Link></div> : <>
        <div className={exploring ? "room-set is-exploring" : "room-set"}>
        <div className="room-heading" inert={exploring}><h1>Campus After Hours</h1><button ref={exploreTriggerRef} type="button" className="room-explore-entry" onClick={enterExplorer}>Explore the room <span aria-hidden="true">↗</span></button></div>
        <RoomExplorer active={exploring} initialScene={initialScene ?? undefined} sceneRequest={sceneRequest} baseHref={roomHref} onReturn={() => { if (initialScene) setDismissedRouteScene(initialScene); setManualExploring(false); setTopic(returnFeedRef.current.topic); setSelectedId(returnFeedRef.current.selectedId); router.replace(roomHref, { scroll: false }); requestAnimationFrame(() => exploreTriggerRef.current?.focus()); }} onSceneChange={(nextTopic) => { if (TOPICS.includes(nextTopic as Topic)) { setTopic(nextTopic as Topic); setSelectedId(captions.find((caption) => caption.topic === nextTopic)?.id ?? null); } }} />
        <div className={exploring ? "room-layout is-exploring" : "room-layout"} inert={exploring}>
        {!exploring && <>
        <button type="button" className="room-window-hotspot" aria-label="Choose a scene for your next meme" onClick={enterExplorer} />
          <section className="stage-column" aria-label="Featured meme">
            {selected ? <div className="stage-frame"><CaptionCard key={selected.id} caption={selected} signedIn myVote={votes[selected.id] ?? 0} featured /></div>
              : <div className="room-empty"><h2>{captions.length ? `No ${topicLabel(topic)} memes in this loaded set yet.` : "The channel is waiting for its first meme."}</h2><p>Switch topics or make a meme from a campus moment.</p><Link href="/create" className="text-link">Make a meme <Icon name="arrow" /></Link></div>}
            <section className="up-next" aria-labelledby="up-next-title">
              <div className="up-next-heading"><h2 id="up-next-title">Up Next</h2><span aria-hidden="true" /></div>
              {upNext.length ? <ul className="thumbnail-list">{upNext.map((caption) => <li key={caption.id}>
                <button type="button" className={`thumbnail-card ${selected?.id === caption.id ? "is-selected" : ""}`} aria-label={`${topicLabel(caption.topic)}: ${caption.setup} ${caption.punchline}`} aria-pressed={selected?.id === caption.id} onClick={() => setSelectedId(caption.id)}>
                  <span className="thumbnail-image">{caption.image_path && caption.image_url ? <Image src={caption.image_url} alt="" fill unoptimized sizes="(max-width: 640px) 72vw, 240px" /> : <span aria-hidden="true">THP</span>}</span>
              <span className="thumbnail-label">{topicLabel(caption.topic)}</span>
                </button>
              </li>)}</ul> : <p className="up-next-empty">You’re caught up in this feed batch.</p>}
            </section>
          </section>
          <aside className="room-aside" aria-label="Room prompt and scene selector">
            <details className="prompt-note">
              <summary><span className="tape tape-one" aria-hidden="true" /><span className="tape tape-two" aria-hidden="true" /><span className="prompt-eyebrow">TODAY’S PROMPT</span><span className="prompt-copy">{dailyPrompt}</span><span className="prompt-summary-link">Make a meme <Icon name="arrow" /></span></summary>
              <div className="prompt-expanded"><p>Take this daily idea into the studio. The prompt stays editable, and you can switch the topic before publishing.</p><Link href={promptHref} className="text-link">Open in the studio <Icon name="arrow" /></Link><Link href="/create" className="blank-prompt-link">Start with a blank prompt</Link></div>
            </details>
            <button type="button" className="mobile-scene-trigger" aria-label="Explore campus settings" onClick={enterExplorer}>Explore the room <span aria-hidden="true">→</span></button>
          </aside>
        </>}
        {exploring && selected && <section className="explore-featured" aria-label="Featured meme from the room"><div className="explore-featured-label">ON THE RADIO NOW · {topicLabel(selected.topic).toUpperCase()}</div><div className="stage-frame"><CaptionCard key={selected.id} caption={selected} signedIn myVote={votes[selected.id] ?? 0} featured /></div></section>}
        </div>
      </div>
      <RoomDestinationRail active={!exploring} onSelect={enterDestination} />
      <section className="feed-more" aria-labelledby="more-title" inert={exploring}>
        <div className="feed-more-heading"><div><p className="room-kicker">THE REST OF THE SET</p><h2 id="more-title">More from the feed</h2></div>
          <nav className="feed-order" aria-label="Feed order"><Link href="/?sort=new&page=0" aria-current={sort === "new" ? "page" : undefined}>Newest</Link><Link href="/?sort=week&page=0" aria-current={sort === "week" ? "page" : undefined}>Top this week</Link></nav>
        </div>
        {filtered.length ? <ul className="room-feed-grid">{filtered.filter((caption) => caption.id !== selected?.id).map((caption) => <li key={caption.id}><CaptionCard caption={caption} signedIn myVote={votes[caption.id] ?? 0} /></li>)}</ul> : <p className="room-empty compact">Nothing in this channel on this page. Try another channel or browse the next page.</p>}
        <nav aria-label="Feed pages" className="feed-pages">
          {page > 0 ? <Link href={`/?sort=${sort}&page=${page - 1}`}>← Previous page</Link> : <span />}
          <span>Page {page + 1} · {sort === "week" ? "Top this week" : "Newest"}</span>
          {captions.length === 30 && page < 1000 ? <Link href={`/?sort=${sort}&page=${page + 1}`}>Next page →</Link> : <span />}
        </nav>
      </section>
    </>}
  </>;
}
