"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { RoomExplorer } from "@/components/room-explorer";
import { RoomDestinationRail } from "@/components/room-destination-rail";
import type { RoomSceneId } from "@/lib/room-scenes";

const samples = [
  { src: "/room/animals/campus-raccoon.webp", topic: "Campus", label: "The backpack is carrying the semester", scene: "campus" },
  { src: "/room/animals/subway-dog.webp", topic: "NYC", label: "The train said two minutes again", scene: "subway" },
  { src: "/room/animals/dorm-cat.webp", topic: "Dorm life", label: "Laundry has claimed the second bed", scene: "dorm" },
  { src: "/room/animals/dining-cat.webp", topic: "Dining hall", label: "I came for one last pancake", scene: "dining" },
] as const satisfies readonly { src: string; topic: string; label: string; scene: RoomSceneId }[];

export function DemoRoom() {
  const [exploring, setExploring] = useState(false);
  const [openStudio, setOpenStudio] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [sceneRequest, setSceneRequest] = useState<{ scene: RoomSceneId; token: number } | null>(null);
  const browseRef = useRef<HTMLButtonElement>(null);
  const upNext = samples.map((sample, index) => ({ sample, index })).filter(({ index }) => index !== selected).slice(0, 3);
  const feature = selected < 0 ? { src: "/room/animals/library-cat.webp", topic: "LIBRARY · CAMPUS", top: "ME: JUST ONE MORE PAGE", bottom: "ALSO ME: 37 TABS OPEN" } : {
    src: samples[selected].src, topic: `${samples[selected].topic.toUpperCase()} · SAMPLE`, top: samples[selected].label.toUpperCase(), bottom: "ME, COMPLETELY UNDER CONTROL",
  };
  function openScene(scene: RoomSceneId, create = false) {
    setSceneRequest((current) => ({ scene, token: (current?.token ?? 0) + 1 }));
    setOpenStudio(create);
    setExploring(true);
  }
  return <main id="main-content" className="campus-page demo-page"><div className="campus-page-width">
    <nav aria-label="Demo navigation" className="site-nav demo-nav"><a href="/demo" className="radio-logo" aria-label="The Humor Project demo home"><Image src="/room/radio-v5.webp" alt="" width={92} height={62} /></a><div className="demo-nav-tabs"><button ref={browseRef} type="button" aria-current={!exploring ? "page" : undefined} onClick={() => { setExploring(false); setOpenStudio(false); requestAnimationFrame(() => browseRef.current?.focus()); }}>Browse</button><button type="button" aria-current={exploring && openStudio ? "page" : undefined} onClick={() => openScene(selected < 0 ? "library" : samples[selected].scene, true)}>Create</button></div><span className="demo-nav-label">Preview</span></nav>
    <div className="demo-banner"><span>LOCAL PLAYGROUND</span><p>Sample animals and scenes · preview interactions only · nothing saves or publishes</p></div>
    <RoomExplorer demo active={exploring} sceneRequest={sceneRequest} studioOpen={openStudio} onStudioOpenChange={setOpenStudio} onReturn={() => { setExploring(false); setOpenStudio(false); requestAnimationFrame(() => browseRef.current?.focus()); }} />
    <section className="demo-lounge" inert={exploring} aria-labelledby="demo-title">
      <div className="demo-lounge-heading"><div><p className="demo-overline">THE LATE-NIGHT CAMPUS MEME ROOM</p><h1 id="demo-title">Campus After Hours</h1><p className="demo-lounge-subtitle">The room is yours. Pick a meme, then go see where the night takes you.</p></div><button type="button" className="demo-explore-button" onClick={() => openScene(selected < 0 ? "library" : samples[selected].scene)}>Explore the room <span aria-hidden="true">↗</span></button></div>
      <div className="demo-feature"><div className="demo-feature-photo"><Image src={feature.src} alt="Animal sample meme in a campus setting" fill priority sizes="(max-width: 900px) 100vw, 760px" /><span className="demo-photo-chip">{feature.topic}</span><span className="demo-meme-top">{feature.top}</span><span className="demo-meme-bottom">{feature.bottom}</span></div><div className="demo-feature-footer"><div><span className="demo-live-dot" /> FEATURED FROM THE ROOM</div><span className="demo-no-votes">Sample meme · votes disabled</span></div></div>
      <div className="demo-sample-row"><div><p className="demo-overline">UP NEXT</p><h2>Other corners of the night</h2></div><ul>{upNext.map(({ sample, index }) => <li key={sample.topic}><button type="button" className="demo-thumbnail-button" aria-pressed={selected === index} aria-label={`Show sample meme from ${sample.topic}`} onClick={() => setSelected(index)}><div className="demo-thumb"><Image src={sample.src} alt="" fill sizes="(max-width: 600px) 100vw, 250px" /></div><div className="demo-thumb-copy"><span>{sample.topic}</span><p>{sample.label}</p></div></button></li>)}</ul></div>
      <RoomDestinationRail active={!exploring} onSelect={(scene) => openScene(scene)} />
    </section>
  </div></main>;
}
