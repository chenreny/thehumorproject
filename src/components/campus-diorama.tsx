"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { vote as saveVote, voteCuratedMeme as saveCuratedVote } from "@/app/vote-actions";
import type { Caption } from "@/lib/captions";
import { upvoteCount } from "@/lib/upvotes";
import { Icon } from "@/components/icon";
import styles from "./campus-diorama.module.css";

type RegionId = "campus" | "ktown" | "east-village";
type ThemeId = "study" | "dorm" | "late-bites" | "karaoke" | "cheap-eats" | "live-music";
type FeedLocation = "all" | "Campus" | "Ktown" | "EastVillage";
type Region = {
  id: RegionId;
  name: string;
  title: string;
  scene: string;
  x: number;
  y: number;
  themes: readonly [ThemeId, ThemeId];
  hotspotPositions: readonly [{ x: number; y: number }, { x: number; y: number }];
  spritePosition: string;
};
type Sample = { id: string; region: RegionId; theme: ThemeId; image: string; top: string; bottom: string; alt: string; template?: string; caption?: Caption };
type Reaction = { region: RegionId; theme?: ThemeId; kind: "laugh" | "browse"; key: number };

const regions: readonly Region[] = [
  { id: "campus", name: "Campus", title: "Campus memes", scene: "campus-night-v1.webp", x: 53, y: 18, themes: ["study", "dorm"], hotspotPositions: [{ x: 32, y: 58 }, { x: 77, y: 66 }], spritePosition: "50% 0%" },
  { id: "ktown", name: "Ktown", title: "Ktown memes", scene: "ktown-night-v1.webp", x: 55, y: 53, themes: ["late-bites", "karaoke"], hotspotPositions: [{ x: 32, y: 58 }, { x: 77, y: 66 }], spritePosition: "0% 0%" },
  { id: "east-village", name: "East Village", title: "East Village memes", scene: "east-village-night-v1.webp", x: 65, y: 65, themes: ["cheap-eats", "live-music"], hotspotPositions: [{ x: 32, y: 58 }, { x: 77, y: 66 }], spritePosition: "100% 0%" },
];

const themes: Record<ThemeId, { label: string; icon: string }> = {
  study: { label: "Study", icon: "✦" }, dorm: { label: "Dorm life", icon: "⌂" },
  "late-bites": { label: "Late bites", icon: "♨" }, karaoke: { label: "Karaoke", icon: "♫" },
  "cheap-eats": { label: "Cheap eats", icon: "♨" }, "live-music": { label: "Live music", icon: "♫" },
};

const samples: readonly Sample[] = [
  { id: "campus-food-midnight", region: "campus", theme: "study", image: "/room/animals/library-cat.webp", top: "STUDY GROUP AT THE LIBRARY", bottom: "WE HAVE OPENED ONE SLIDE IN 40 MINUTES", alt: "Cat guarding a late campus study session" },
  { id: "campus-all-dorm", region: "campus", theme: "dorm", image: "/room/animals/dorm-cat.webp", top: "LIGHTS OUT AT 12", bottom: "GROUP PROJECT CALL AT 12:01", alt: "Cat among dorm room laundry" },
  { id: "campus-study-harold", region: "campus", theme: "study", image: "/meme-templates/hide-the-pain-harold.jpg", top: "STUDY PLAN: START AT 7", bottom: "IT'S 7:03 AND I'M IN THE SNACK DRAWER", alt: "Two-panel smiling man working at a laptop", template: "hide-the-pain-harold" },
  { id: "campus-dorm-disaster", region: "campus", theme: "dorm", image: "/meme-templates/disaster-girl.jpg", top: "THE DORM FIRE ALARM GOES OFF AGAIN", bottom: "WE ARE ALL GOING BACK TO SLEEP", alt: "Smiling girl with a fire engine in the background", template: "disaster-girl" },
  { id: "campus-study-impossible", region: "campus", theme: "study", image: "/meme-templates/one-does-not-simply.jpg", top: "I'LL JUST READ THE ASSIGNMENT ONCE", bottom: "IT'S A 90-PAGE PRIMARY SOURCE", alt: "Man in a cloak gesturing seriously", template: "one-does-not-simply" },
  { id: "ktown-food-bakery", region: "ktown", theme: "late-bites", image: "/room/animals/dining-cat.webp", top: "ONE MORE KOREAN CORN DOG", bottom: "WE CAN WALK IT OFF", alt: "Cat ready for a Ktown late night snack" },
  { id: "ktown-karaoke-encore", region: "ktown", theme: "karaoke", image: "/room/animals/dorm-cat.webp", top: "ONE LAST KARAOKE SONG", bottom: "THE SUN IS COMING UP", alt: "Cat keeping the karaoke night going" },
  { id: "east-food-dumplings", region: "east-village", theme: "cheap-eats", image: "/room/animals/dining-cat.webp", top: "WE ORDERED A SMALL SNACK", bottom: "THE TABLE IS NOW FULL", alt: "Cat arriving for a late night meal" },
  { id: "east-clubs-live", region: "east-village", theme: "live-music", image: "/room/animals/campus-raccoon.webp", top: "WE CAME TO SEE ONE BAND", bottom: "WE LEFT WITH THREE NEW FAVORITES", alt: "Raccoon out for live music" },
  { id: "east-clubs-dj", region: "east-village", theme: "live-music", image: "/room/animals/dorm-cat.webp", top: "SAME PEOPLE, DIFFERENT DJ", bottom: "SOMEHOW IT'S STILL OUR SONG", alt: "Cat ready for a night out with friends" },
  { id: "east-all-sidequest", region: "east-village", theme: "cheap-eats", image: "/room/animals/subway-dog.webp", top: "QUICK TRIP TO THE EAST VILLAGE", bottom: "BACK WITH A STORY AND LEFTOVERS", alt: "Dog with pizza on a New York night" },
  { id: "east-all-walk", region: "east-village", theme: "live-music", image: "/room/animals/campus-raccoon.webp", top: "IT'S ONLY A FEW BLOCKS", bottom: "WE HAVE WALKED FOR 40 MINUTES", alt: "Raccoon on a long city night walk" },
  { id: "east-cheap-harold", region: "east-village", theme: "cheap-eats", image: "/meme-templates/hide-the-pain-harold.jpg", top: "THE SPECIAL IS ONLY $8", bottom: "PLUS TAX, TIP, AND THE STUDENT BUDGET", alt: "Two-panel smiling man working at a laptop", template: "hide-the-pain-harold" },
  { id: "east-music-disaster", region: "east-village", theme: "live-music", image: "/meme-templates/disaster-girl.jpg", top: "ONE QUIET SONG AT THE SHOW", bottom: "THE VENUE HAS A THREE-ALARM LIGHT SHOW", alt: "Smiling girl with a fire engine in the background", template: "disaster-girl" },
];

const assetRoot = "/room/playground/nyc/";
const dogPhotoImage = "/room/animals/subway-dog.webp";
const locationOptions: readonly { id: FeedLocation; label: string }[] = [
  { id: "all", label: "All locations" }, { id: "Campus", label: "Campus" }, { id: "Ktown", label: "Ktown" }, { id: "EastVillage", label: "East Village" },
];

function readLocation(value: string | undefined): FeedLocation {
  return locationOptions.some((option) => option.id === value) ? value as FeedLocation : "all";
}

export function CampusDiorama({ initialFeed = false, initialLocation = "all", captions = [], initialVotes = {}, initialSampleVotes = {}, initialSampleUpvotes = {}, signedIn = false, feedError = false, homeHref = "/playground", standaloneFeed = false }: { initialFeed?: boolean; initialLocation?: FeedLocation; captions?: Caption[]; initialVotes?: Record<string, number>; initialSampleVotes?: Record<string, number>; initialSampleUpvotes?: Record<string, number>; signedIn?: boolean; feedError?: boolean; homeHref?: string; standaloneFeed?: boolean }) {
  const artAreaRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Partial<Record<RegionId, HTMLButtonElement | null>>>({});
  const feedTitleRef = useRef<HTMLHeadingElement>(null);
  const allMemesRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number; scaleY: number } | null>(null);
  const [view, setView] = useState<"overview" | "street">("overview");
  const [regionId, setRegionId] = useState<RegionId>("east-village");
  const [collectionRegion, setCollectionRegion] = useState<RegionId | null>(null);
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  const [selectedId, setSelectedId] = useState("campus-food-midnight");
  const [ratings, setRatings] = useState<Record<string, 1 | -1>>(initialSampleVotes as Record<string, 1 | -1>);
  const [sampleUpvoteCounts, setSampleUpvoteCounts] = useState(initialSampleUpvotes);
  const [pendingSampleVote, setPendingSampleVote] = useState<string | null>(null);
  const [sampleVoteErrors, setSampleVoteErrors] = useState<Record<string, string>>({});
  const [captionRatings, setCaptionRatings] = useState<Record<string, number>>(initialVotes);
  const [pendingCaptionVote, setPendingCaptionVote] = useState<string | null>(null);
  const [captionVoteErrors, setCaptionVoteErrors] = useState<Record<string, string>>({});
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [feedOpen, setFeedOpen] = useState(initialFeed);
  const [feedLocation, setFeedLocation] = useState<FeedLocation>(initialLocation);
  const reactionKey = useRef(0);
  const feedOpenedFromCity = useRef(false);
  useEffect(() => {
    const artArea = artAreaRef.current;
    if (!artArea) return;
    const measure = () => {
      const { width, height } = artArea.getBoundingClientRect();
      if (!width || !height) return;
      const imageRatio = 1586 / 992;
      const fitMobile = window.matchMedia("(max-width: 900px)").matches;
      const canvasWidth = fitMobile ? Math.min(width, height * imageRatio) : Math.max(width, height * imageRatio);
      const next = { width: canvasWidth, height: canvasWidth / imageRatio, scaleY: fitMobile ? .8 : Math.min(1, height / (canvasWidth / imageRatio)) };
      setCanvasSize((current) => current?.width === next.width && current.height === next.height && current.scaleY === next.scaleY ? current : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(artArea);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [feedOpen]);

  useEffect(() => {
    const syncLocation = () => {
      const url = new URL(window.location.href);
      const nextOpen = standaloneFeed || url.searchParams.get("view") === "feed";
      setFeedOpen(nextOpen);
      setFeedLocation(readLocation(url.searchParams.get("location") ?? undefined));
      requestAnimationFrame(() => {
        if (nextOpen) feedTitleRef.current?.focus({ preventScroll: true });
        else allMemesRef.current?.focus({ preventScroll: true });
      });
    };
    window.addEventListener("popstate", syncLocation);
    return () => window.removeEventListener("popstate", syncLocation);
  }, [standaloneFeed]);

  const region = regions.find((item) => item.id === regionId)!;
  const memberSamples = useMemo<Sample[]>(() => captions.map((caption) => {
    const region: RegionId = caption.topic === "Ktown" ? "ktown" : caption.topic === "EastVillage" || caption.topic === "East Village" || caption.topic === "NYC" ? "east-village" : "campus";
    return { id: `caption-${caption.id}`, region, theme: regions.find((item) => item.id === region)!.themes[0], image: "", top: caption.setup, bottom: caption.punchline, alt: "", caption };
  }), [captions]);
  const allSamples = useMemo(() => [...memberSamples, ...samples], [memberSamples]);
  const featuredSamples = useMemo(() => [...samples, ...memberSamples], [memberSamples]);
  const visibleSamples = useMemo(() => featuredSamples.filter((item) => (collectionRegion === null || item.region === collectionRegion) && (themeId === null || item.theme === themeId)), [featuredSamples, collectionRegion, themeId]);
  const selected = visibleSamples.find((item) => item.id === selectedId) ?? visibleSamples[0] ?? null;
  const selectedIndex = selected ? visibleSamples.findIndex((item) => item.id === selected.id) : -1;
  const selectedRegion = selected ? regions.find((item) => item.id === selected.region) ?? null : null;
  const sampleRating = selected ? ratings[selected.id] ?? 0 : 0;
  const collectionTitle = themeId ? themes[themeId].label : collectionRegion === null ? "NYC memes" : regions.find((item) => item.id === collectionRegion)!.title;
  const feedRegion = feedLocation === "Campus" ? "campus" : feedLocation === "Ktown" ? "ktown" : feedLocation === "EastVillage" ? "east-village" : null;
  const feedSamples = useMemo(() => allSamples.filter((item) => feedRegion === null || item.region === feedRegion), [allSamples, feedRegion]);

  const updateFeedUrl = useCallback((open: boolean, location: FeedLocation, replace = false) => {
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("view", "feed");
      if (location === "all") url.searchParams.delete("location");
      else url.searchParams.set("location", location);
    } else {
      url.searchParams.delete("view");
      url.searchParams.delete("location");
    }
    const state = window.history.state;
    window.history[replace ? "replaceState" : "pushState"](state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  function openFeed() {
    if (!feedOpen) {
      updateFeedUrl(true, "all");
      feedOpenedFromCity.current = true;
    }
    setFeedLocation("all");
    setFeedOpen(true);
    requestAnimationFrame(() => feedTitleRef.current?.focus({ preventScroll: true }));
  }

  function closeFeed() {
    if (feedOpenedFromCity.current) {
      window.history.back();
      return;
    }
    updateFeedUrl(false, "all", true);
    setFeedOpen(false);
    setFeedLocation("all");
    requestAnimationFrame(() => allMemesRef.current?.focus({ preventScroll: true }));
  }

  function selectFeedLocation(next: FeedLocation) {
    setFeedLocation(next);
    updateFeedUrl(true, next, true);
  }

  function selectRegion(id: RegionId) {
    setRegionId(id);
    setCollectionRegion(id);
    setThemeId(null);
    setSelectedId(samples.find((item) => item.region === id)!.id);
    setReaction(null);
    setView("street");
  }

  function showMap() {
    setView("overview");
    setReaction(null);
    requestAnimationFrame(() => markerRefs.current[regionId]?.focus({ preventScroll: true }));
  }

  function selectTheme(next: ThemeId) {
    setThemeId(next);
    const first = samples.find((item) => (collectionRegion === null || item.region === collectionRegion) && item.theme === next);
    if (first) setSelectedId(first.id);
    setReaction(null);
  }

  function browse(index: number) {
    const next = visibleSamples[(index + visibleSamples.length) % visibleSamples.length];
    setSelectedId(next.id);
    setReaction({ region: next.region, theme: next.theme, kind: "browse", key: ++reactionKey.current });
  }

  function clearReaction(key: number) {
    setReaction((current) => current?.key === key ? null : current);
  }

  async function rateSample(sampleId: string, value: 1 | -1) {
    if (!signedIn || pendingSampleVote) return;
    const turningOnFunny = value === 1 && ratings[sampleId] !== 1;
    const ratedSample = samples.find((item) => item.id === sampleId)!;
    setPendingSampleVote(sampleId);
    setSampleVoteErrors((current) => { const next = { ...current }; delete next[sampleId]; return next; });
    try {
      const result = await saveCuratedVote(sampleId, value);
      if (result.error || result.vote === undefined || result.upvotes === undefined) {
        setSampleVoteErrors((current) => ({ ...current, [sampleId]: result.error ?? "Your vote wasn't saved. Please try again." }));
        return;
      }
      setRatings((current) => {
        const next = { ...current };
        if (result.vote === null) delete next[sampleId];
        else next[sampleId] = result.vote as 1 | -1;
        return next;
      });
      setSampleUpvoteCounts((current) => ({ ...current, [sampleId]: result.upvotes! }));
      setReaction(turningOnFunny && !feedOpen ? { region: ratedSample.region, theme: ratedSample.theme, kind: "laugh", key: ++reactionKey.current } : null);
    } catch {
      setSampleVoteErrors((current) => ({ ...current, [sampleId]: "Your vote wasn't saved. Please try again." }));
    } finally {
      setPendingSampleVote(null);
    }
  }

  async function rateCaption(captionId: string, value: 1 | -1) {
    if (!signedIn || pendingCaptionVote) return;
    setPendingCaptionVote(captionId);
    setCaptionVoteErrors((current) => { const next = { ...current }; delete next[captionId]; return next; });
    try {
      const result = await saveVote(captionId, value);
      if (result.error) setCaptionVoteErrors((current) => ({ ...current, [captionId]: result.error! }));
      else setCaptionRatings((current) => ({ ...current, [captionId]: value }));
    } catch {
      setCaptionVoteErrors((current) => ({ ...current, [captionId]: "Your vote wasn't saved. Please try again." }));
    } finally {
      setPendingCaptionVote(null);
    }
  }

  const isDogPhoto = selected !== null && !selected.caption && selected.image === dogPhotoImage;
  const sceneStyle = { "--region-x": `${region.x}%`, "--region-y": `${region.y}%` } as CSSProperties;
  return <main className={styles.shell}>
    <a className={styles.skipLink} href={feedOpen ? "#feed-title" : "#meme-viewer"}>Skip to content</a>
    {signedIn && homeHref === "/" ? <header className={`${styles.hud} ${styles.sharedHud}`}>
      <nav className={styles.sharedNav} aria-label="Main navigation">
        <Link href={homeHref} className={styles.brand} aria-label="The Humor Project home"><Image src="/room/radio-v5.webp" alt="" width={92} height={62} className={styles.brandImage} /></Link>
        <div className={styles.sharedNavCenter}>
          <Link href="/" aria-current={!feedOpen ? "page" : undefined}>Home</Link>
          <Link ref={(element) => { allMemesRef.current = element; }} href="/memes" aria-current={feedOpen ? "page" : undefined}>Browse</Link>
          <Link href="/create" prefetch={false}>Create</Link>
        </div>
        <div className={styles.sharedAccount}>
          <Link href="/profile">Profile</Link>
          <form action="/auth/logout" method="post"><button type="submit">Sign out</button></form>
        </div>
      </nav>
    </header> : <header className={styles.hud}>
      <Link href={homeHref} className={styles.brand} aria-label="The Humor Project home" onClick={(event) => { if (feedOpen && !standaloneFeed) { event.preventDefault(); closeFeed(); } }}><Image src="/room/radio-v5.webp" alt="" width={92} height={62} className={styles.brandImage} /></Link>
      <nav className={styles.hudActions} aria-label="Browse navigation">{feedOpen ? <button type="button" className={styles.backToCity} onClick={closeFeed}>← Back to city</button> : <button ref={(element) => { allMemesRef.current = element; }} type="button" className={styles.allMemesTop} onClick={openFeed}>All memes</button>}<Link className={styles.createLink} href="/create" prefetch={false}>Create meme <span aria-hidden="true">✦</span></Link>{signedIn && <><Link className={styles.accountLink} href="/profile">Profile</Link><form action="/auth/logout" method="post"><button className={styles.accountLink} type="submit">Sign out</button></form></>}</nav>
    </header>}

    {feedOpen ? <section className={`${styles.feedPage} ${standaloneFeed ? styles.standaloneFeed : ""}`} aria-labelledby="feed-title">
      <header className={styles.feedIntro}>{standaloneFeed ? <div className={styles.wallLeadTitle}><h1 id="feed-title" ref={feedTitleRef} tabIndex={-1}>The meme wall.</h1></div> : <><p className={styles.eyebrow}>THE HUMOR PROJECT / BROWSE</p><h1 id="feed-title" ref={feedTitleRef} tabIndex={-1}>All memes</h1><p>Every late night, every neighborhood. Pick a place and browse the whole wall.</p></>}{signedIn && homeHref === "/" && !standaloneFeed && <button type="button" className={styles.feedBack} onClick={closeFeed}>← Back to city</button>}</header>
      <nav className={styles.locationFilters} aria-label="Filter memes by location">{locationOptions.map((option) => {
        const optionRegion = option.id === "Campus" ? "campus" : option.id === "Ktown" ? "ktown" : option.id === "EastVillage" ? "east-village" : null;
        const count = optionRegion === null ? allSamples.length : allSamples.filter((item) => item.region === optionRegion).length;
        return <button key={option.id} type="button" onClick={() => selectFeedLocation(option.id)} aria-pressed={feedLocation === option.id}>{option.label}<span>{count}</span></button>;
      })}</nav>
      {feedError && <p className={styles.feedError} role="alert">Some memes could not be fully loaded. Please refresh to try again.</p>}
      {feedSamples.length ? <div className={styles.memeGrid}>{feedSamples.map((item) => {
        const rating = item.caption ? captionRatings[item.caption.id] ?? 0 : ratings[item.id] ?? 0;
        const count = item.caption ? upvoteCount(item.caption, initialVotes[item.caption.id] ?? 0, rating) : sampleUpvoteCounts[item.id] ?? 0;
        const votePending = item.caption ? pendingCaptionVote === item.caption.id : pendingSampleVote === item.id;
        const voteDisabled = !signedIn || pendingCaptionVote !== null || pendingSampleVote !== null;
        const isDogPhoto = !item.caption && item.image === dogPhotoImage;
        const ratingControls = <div className={styles.feedRatings} role="group" aria-label={`Rate meme: ${item.top}`} aria-busy={votePending}>
          <button type="button" className={styles.voteButton} title="Upvote meme" disabled={voteDisabled || rating === 1} onClick={() => item.caption ? void rateCaption(item.caption.id, 1) : void rateSample(item.id, 1)} aria-label="Upvote meme" aria-pressed={rating === 1}><Icon name="thumb" className={styles.voteThumb} /></button>
          <span className={styles.voteCount} aria-label={`${count} upvotes`}>{count}</span>
          <button type="button" className={`${styles.voteButton} ${styles.voteDown}`} title="Downvote meme" disabled={voteDisabled || rating === -1} onClick={() => item.caption ? void rateCaption(item.caption.id, -1) : void rateSample(item.id, -1)} aria-label="Downvote meme" aria-pressed={rating === -1}><Icon name="thumb" className={styles.voteThumb} /></button>
          {votePending && <span role="status">Saving vote…</span>}
          {item.caption ? captionVoteErrors[item.caption.id] && <span role="alert">{captionVoteErrors[item.caption.id]}</span> : sampleVoteErrors[item.id] && <span role="alert">{sampleVoteErrors[item.id]}</span>}
        </div>;
        return <article className={styles.feedCard} key={item.id}>
          {item.caption ? <div className={`${styles.feedImage} ${styles.memberMeme}`}>{item.caption.image_path && <Image src={item.caption.image_url ?? `/captions/${item.caption.id}/image`} alt={item.caption.image_description || "Published meme image"} fill unoptimized sizes={standaloneFeed ? "(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw" : "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"} />}<span className={styles.memeTop}>{item.top}</span><span className={styles.memeBottom}>{item.bottom}</span></div> : <div className={`${styles.feedImage} ${isDogPhoto ? styles.dogPhotoFeed : ""}`}><Image src={item.image} alt={item.alt} fill sizes={standaloneFeed ? "(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw" : "(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"} className={item.template ? styles.templateImage : undefined} /><span className={styles.memeTop}>{item.top}</span><span className={styles.memeBottom}>{item.bottom}</span></div>}
          {standaloneFeed ? <div className={styles.wallCardFoot}>{ratingControls}</div> : ratingControls}
        </article>;
      })}</div> : <p className={styles.emptyFeed}>No memes in this location yet.</p>}
    </section> : <div className={styles.experience}>
      <section className={`${styles.world} ${view === "street" ? styles.streetView : styles.overviewView}`} aria-label={view === "overview" ? "NYC neighborhood map" : `${region.name} street scene`} style={sceneStyle}>
        <div className={styles.artArea} ref={artAreaRef} style={canvasSize ? { "--canvas-width": `${canvasSize.width}px`, "--canvas-height": `${canvasSize.height}px`, "--scene-scale-y": canvasSize.scaleY } as CSSProperties : undefined}>
          <div className={`${styles.scene} ${styles.mapScene}`} aria-hidden="true" />
          {regions.map((item) => <div key={item.id} className={`${styles.scene} ${styles.streetScene} ${view === "street" && regionId === item.id ? styles.streetSceneActive : ""}`} style={{ backgroundImage: `url("${assetRoot}${item.scene}")` }} aria-hidden="true" />)}
          <div className={styles.sceneShade} aria-hidden="true" />
          {view === "overview" && <div className={styles.mapMarkers} aria-label="Neighborhoods">
            {regions.map((item) => <button key={item.id} ref={(element) => { markerRefs.current[item.id] = element; }} type="button" className={`${styles.marker} ${styles.photoMarker} ${item.id === "ktown" ? styles.ktownMarker : ""} ${reaction?.region === item.id ? styles.markerReacting : ""}`} style={{ "--marker-x": `${item.x}%`, "--marker-y": `${item.y}%`, "--sprite-position": item.spritePosition } as CSSProperties} onClick={() => selectRegion(item.id)} aria-label={`Explore ${item.id === "campus" ? "Columbia" : item.name}`} aria-pressed={collectionRegion === item.id}>
              <span className={styles.markerPhoto} aria-hidden="true">
                <Image src={item.id === "campus" ? "/room/landmarks/columbia.webp" : item.id === "ktown" ? "/room/landmarks/ktown.webp" : "/room/landmarks/east-village.webp"} alt="" fill sizes="(max-width: 430px) 104px, (max-width: 900px) 122px, 154px" className={item.id === "ktown" ? styles.ktownPhoto : undefined} />
                <span className={styles.photoMarkerLabel}>{item.id === "campus" ? "Columbia" : item.name}</span>
              </span>
              <span className={styles.markerDot} aria-hidden="true" />
              {reaction?.region === item.id && <span key={`spark-${reaction.key}`} onAnimationEnd={() => clearReaction(reaction.key)} className={styles.reactionSpark} aria-hidden="true">{reaction.kind === "laugh" ? "✦ haha" : "✧"}</span>}
            </button>)}
          </div>}
          {view === "street" && <>
            <div className={styles.streetTitle}><span aria-hidden="true">⌖</span> {region.name}</div>
            <div className={styles.streetHosts} aria-label={`${region.name} meme themes`}>
              {region.themes.map((theme, index) => <button key={theme} type="button" className={`${styles.hostButton} ${themeId === theme ? styles.hostSelected : ""} ${reaction?.region === region.id && reaction.theme === theme ? styles.hostReacting : ""}`} style={{ "--hotspot-x": `${region.hotspotPositions[index].x}%`, "--hotspot-y": `${region.hotspotPositions[index].y}%`, "--sprite-position": index === 0 ? region.spritePosition : "50% 0%" } as CSSProperties} onClick={() => selectTheme(theme)} aria-label={`Browse ${themes[theme].label} memes in ${region.name}`} aria-pressed={themeId === theme}>
                <span className={styles.hostAnimal} aria-hidden="true" />
                {reaction?.region === region.id && reaction.theme === theme && <span key={`spark-${reaction.key}`} onAnimationEnd={() => clearReaction(reaction.key)} className={styles.reactionSpark} aria-hidden="true">{reaction.kind === "laugh" ? "✦ haha" : "✧"}</span>}
                <span>{themes[theme].icon} {themes[theme].label}</span>
              </button>)}
            </div>
          </>}
        </div>
        {view === "street" && <button type="button" className={styles.mapButton} onClick={showMap}><span aria-hidden="true">▱</span> Map</button>}
      </section>

      <aside className={styles.viewer} id="meme-viewer" tabIndex={-1} aria-label="Meme browser">
        <div className={styles.viewerHeader}><h1>{collectionTitle}</h1><span className={styles.sampleCount} aria-label={visibleSamples.length ? `Meme ${selectedIndex + 1} of ${visibleSamples.length}` : "No memes"}>{visibleSamples.length ? `${selectedIndex + 1} / ${visibleSamples.length}` : "0 memes"}</span></div>
        {selected ? <>
        <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{collectionTitle}, {visibleSamples.length} memes. Featured meme: {selected.top}. Meme {selectedIndex + 1} of {visibleSamples.length}.</p>
        <article className={styles.featured} aria-label={`Featured ${selectedRegion!.name} ${selected.caption ? "published meme" : "sample"}`}>
          {selected.caption ? <div className={`${styles.memeImage} ${styles.memberMeme}`}>{selected.caption.image_path && <Image key={selected.id} src={selected.caption.image_url ?? `/captions/${selected.caption.id}/image`} alt={selected.caption.image_description || "Published meme image"} fill unoptimized sizes="(max-width: 820px) 100vw, 38vw" />}<span className={styles.memeTop}>{selected.top}</span><span className={styles.memeBottom}>{selected.bottom}</span></div> : <div className={`${styles.memeImage} ${isDogPhoto ? styles.dogPhotoViewer : ""}`}><Image key={selected.id} src={selected.image} alt={selected.alt} fill preload sizes="(max-width: 820px) 100vw, 38vw" className={selected.template ? styles.templateImage : undefined} /><span className={styles.memeTop}>{selected.top}</span><span className={styles.memeBottom}>{selected.bottom}</span></div>}
        </article>
        {selected.caption ? <div className={styles.ratingGroup} role="group" aria-label={`Rate meme: ${selected.top}`} aria-busy={pendingCaptionVote === selected.caption.id}>
          {signedIn ? <>
            <button type="button" className={styles.voteButton} title="Upvote meme" aria-label="Upvote meme" aria-pressed={captionRatings[selected.caption.id] === 1} disabled={pendingCaptionVote !== null || captionRatings[selected.caption.id] === 1} onClick={() => void rateCaption(selected.caption!.id, 1)}><Icon name="thumb" className={styles.voteThumb} /></button>
            <span className={styles.voteCount} aria-label={`${upvoteCount(selected.caption, initialVotes[selected.caption.id] ?? 0, captionRatings[selected.caption.id] ?? 0)} upvotes`}>{upvoteCount(selected.caption, initialVotes[selected.caption.id] ?? 0, captionRatings[selected.caption.id] ?? 0)}</span>
            <button type="button" className={`${styles.voteButton} ${styles.voteDown}`} title="Downvote meme" aria-label="Downvote meme" aria-pressed={captionRatings[selected.caption.id] === -1} disabled={pendingCaptionVote !== null || captionRatings[selected.caption.id] === -1} onClick={() => void rateCaption(selected.caption!.id, -1)}><Icon name="thumb" className={styles.voteThumb} /></button>
          </> : <><span className={styles.voteCount} aria-label={`${upvoteCount(selected.caption)} upvotes`}>{upvoteCount(selected.caption)}</span><Link href={`/auth/login?next=/captions/${selected.caption.id}`}>Sign in to vote</Link></>}
          {pendingCaptionVote === selected.caption.id && <p role="status">Saving your vote…</p>}
          {captionVoteErrors[selected.caption.id] && <p role="alert">{captionVoteErrors[selected.caption.id]}</p>}
        </div> : <div className={styles.ratingGroup} role="group" aria-label="Rate featured sample" aria-busy={pendingSampleVote === selected.id}>
          {signedIn ? <>
            <button type="button" className={styles.voteButton} title="Upvote meme" aria-label="Upvote meme" aria-pressed={sampleRating === 1} disabled={pendingSampleVote !== null} onClick={() => void rateSample(selected.id, 1)}><Icon name="thumb" className={styles.voteThumb} /></button>
            <span className={styles.voteCount} aria-label={`${sampleUpvoteCounts[selected.id] ?? 0} upvotes`}>{sampleUpvoteCounts[selected.id] ?? 0}</span>
            <button type="button" className={`${styles.voteButton} ${styles.voteDown}`} title="Downvote meme" aria-label="Downvote meme" aria-pressed={sampleRating === -1} disabled={pendingSampleVote !== null} onClick={() => void rateSample(selected.id, -1)}><Icon name="thumb" className={styles.voteThumb} /></button>
          </> : <><span className={styles.voteCount} aria-label={`${sampleUpvoteCounts[selected.id] ?? 0} upvotes`}>{sampleUpvoteCounts[selected.id] ?? 0}</span><Link href={`/auth/login?next=${encodeURIComponent(homeHref)}`}>Sign in to vote</Link></>}
          {pendingSampleVote === selected.id && <p role="status">Saving your vote…</p>}
          {sampleVoteErrors[selected.id] && <p role="alert">{sampleVoteErrors[selected.id]}</p>}
        </div>}
        <div className={styles.browseControls}><button type="button" onClick={() => browse(selectedIndex - 1)} aria-label="Previous meme in this collection">← <span>Previous</span></button><button type="button" onClick={() => browse(selectedIndex + 1)} aria-label="Next meme in this collection"><span>Next</span> →</button></div>
        </> : <p className={styles.emptyCollection}>No memes in this collection yet.</p>}
      </aside>
    </div>}
  </main>;
}
