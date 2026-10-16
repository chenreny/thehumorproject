"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROOM_SCENES, roomScene, type RoomSceneId } from "@/lib/room-scenes";
import { topicLabel } from "@/lib/generation";
import { Icon } from "@/components/icon";

const HOTSPOT_LABELS: Record<RoomSceneId, string[]> = {
  library: ["One more page…", "Study group side quest", "37 tabs open"],
  campus: ["Three familiar faces", "Scenic shortcut", "Backpack: full semester"],
  subway: ["2 min ETA again", "Guarding a dollar slice", "Express train identity"],
  dorm: ["Laundry took the bed", "Water trip side quest", "Desk is a bed now"],
  dining: ["Last plate dilemma", "Four course snack", "Soft serve diplomacy"],
};

type CaptionPair = { top: string; bottom: string };

export function RoomExplorer({
  initialScene,
  sceneRequest,
  baseHref = "/",
  studioOpen: controlledStudioOpen,
  onReturn,
  onSceneChange,
  onStudioOpenChange,
  demo = false,
  active = true,
}: {
  initialScene?: RoomSceneId;
  sceneRequest?: { scene: RoomSceneId; token: number } | null;
  baseHref?: string;
  studioOpen?: boolean;
  onReturn?: () => void;
  onSceneChange?: (topic: string) => void;
  onStudioOpenChange?: (open: boolean) => void;
  demo?: boolean;
  active?: boolean;
}) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topCaptionRef = useRef<HTMLInputElement>(null);
  const hotspotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sceneId, setSceneId] = useState<RoomSceneId>(initialScene ?? "library");
  const [lastInitialScene, setLastInitialScene] = useState(initialScene);
  const [lastSceneRequest, setLastSceneRequest] = useState(sceneRequest?.token ?? -1);
  const [situation, setSituation] = useState(0);
  const [momentsByScene, setMomentsByScene] = useState<Partial<Record<RoomSceneId, number>>>({});
  const [localStudioOpen, setLocalStudioOpen] = useState(false);
  const studioOpen = controlledStudioOpen ?? localStudioOpen;
  const [captionEdits, setCaptionEdits] = useState<Record<string, CaptionPair>>({});
  const [promptEdits, setPromptEdits] = useState<Record<string, string>>({});
  const [boldCaption, setBoldCaption] = useState(true);
  if (initialScene !== lastInitialScene) {
    setLastInitialScene(initialScene);
    if (initialScene && initialScene !== sceneId) {
      setSceneId(initialScene);
      setSituation(momentsByScene[initialScene] ?? 0);
    }
  }
  if (sceneRequest && sceneRequest.token !== lastSceneRequest) {
    setLastSceneRequest(sceneRequest.token);
    setLocalStudioOpen(false);
    if (sceneRequest.scene !== sceneId) {
      setSceneId(sceneRequest.scene);
      setSituation(momentsByScene[sceneRequest.scene] ?? 0);
    }
  }
  const scene = roomScene(sceneId) ?? ROOM_SCENES[0];
  const promptKey = `${scene.id}:${situation}`;
  const prompt = promptEdits[promptKey] ?? scene.situations[situation];
  const suggestedCaption = scene.captions[situation];
  const editedCaption = captionEdits[promptKey] ?? suggestedCaption;
  const previewCaption = studioOpen ? editedCaption : suggestedCaption;

  useEffect(() => {
    if (!active) return;
    if (studioOpen) topCaptionRef.current?.focus();
    else headingRef.current?.focus();
  }, [active, sceneId, studioOpen]);

  function setComposerOpen(open: boolean) {
    setLocalStudioOpen(open);
    onStudioOpenChange?.(open);
  }

  function travel(id: RoomSceneId) {
    setSceneId(id);
    setSituation(momentsByScene[id] ?? 0);
    setComposerOpen(false);
    onSceneChange?.(roomScene(id)?.topic ?? "Campus");
    if (!demo) {
      const separator = baseHref.includes("?") ? "&" : "?";
      router.replace(`${baseHref}${separator}${new URLSearchParams({ scene: id }).toString()}`, { scroll: false });
    }
  }

  function selectMoment(index: number) {
    setSituation(index);
    setMomentsByScene((current) => ({ ...current, [scene.id]: index }));
  }

  function updateCaption(next: CaptionPair) {
    setCaptionEdits((current) => ({ ...current, [promptKey]: next }));
  }

  function resetCaption() {
    setCaptionEdits((current) => {
      const next = { ...current };
      delete next[promptKey];
      return next;
    });
  }

  const studioQuery = new URLSearchParams({ scene: scene.id, topic: scene.topic, prompt, template: scene.template });

  return (
    <section className={`room-explorer scene-${scene.id}${demo ? " is-demo" : ""}${active ? " is-active" : ""}`} aria-labelledby="explore-title" hidden={!active}>
      <div className="explore-toolbar">
        <div>
          <p className="explore-kicker">YOU ARRIVED · STOP {scene.mark} / {topicLabel(scene.topic).toUpperCase()}</p>
          <h2 id="explore-title" ref={headingRef} tabIndex={-1}>{scene.name} after hours</h2>
          <p className="explore-mood">{scene.mood}</p>
        </div>
        <button type="button" className="return-room" onClick={() => { if (onReturn) onReturn(); else router.replace(baseHref, { scroll: false }); }}>
          <span aria-hidden="true">←</span> Back to the room
        </button>
      </div>

      <nav className="travel-strip" aria-label="Choose a place to explore">
        {ROOM_SCENES.map((item) => (
          <button type="button" key={item.id} className={`travel-stop${scene.id === item.id ? " is-current" : ""}`} aria-pressed={scene.id === item.id} onClick={() => travel(item.id)}>
            <Image src={item.image} alt="" width={40} height={30} className="travel-stop-photo" />
            <span className="travel-stop-copy"><span className="travel-number">{item.mark}</span><span>{item.name}</span></span>
            {scene.id === item.id && <span className="travel-dot" aria-hidden="true">●</span>}
          </button>
        ))}
      </nav>

      <div className="explore-scene" key={scene.id}>
        <div className="explore-scene-photo">
          <Image src={scene.image} alt={`${scene.name} after dark, with an animal in the scene`} fill priority sizes="100vw" />
          <span className="scene-location"><span aria-hidden="true">●</span> {scene.name} · {topicLabel(scene.topic)}</span>
          <span className="scene-stars" aria-hidden="true">✦　·　✦</span>
          <span className="scene-environment" aria-hidden="true" />
          <div className="scene-hotspots" role="group" aria-label={`${scene.name} scene moments`}>
            {scene.situations.map((item, index) => (
              <button ref={(element) => { hotspotRefs.current[index] = element; }} type="button" key={item} className={`scene-hotspot hotspot-${index + 1}${situation === index ? " is-selected" : ""}`} aria-pressed={situation === index} onClick={() => selectMoment(index)}>
                <span className="hotspot-pin" aria-hidden="true">{situation === index ? "✓" : "+"}</span>
                <span className="hotspot-label">{HOTSPOT_LABELS[scene.id][index]}</span>
              </button>
            ))}
          </div>
          <span className="scene-photo-caption">{scene.situations[situation]}</span>
        </div>

        <div className={`scene-story${studioOpen ? " is-composing" : ""}`}>
          <div className="scene-story-head">
            <span className="scene-coordinate">A SCENE WORTH SHARING</span>
            <h3>{scene.name}</h3>
            <p>{studioOpen ? "Tune the caption to this exact moment." : "Tap a little moment in the scene, then carry it into your meme."}</p>
          </div>

          {!studioOpen && <div className="scene-moment-response" aria-live="polite" aria-atomic="true">
            <span>THE MOMENT</span>
            <p>{scene.responses[situation]}</p>
            <div className="scene-caption-suggestion" aria-label={`Suggested caption: ${suggestedCaption.top}; ${suggestedCaption.bottom}`}>
              <span>{suggestedCaption.top}</span><span>{suggestedCaption.bottom}</span>
            </div>
          </div>}

          {!studioOpen && <div className="scene-story-moments" role="group" aria-label="Choose a scene moment">
            {scene.situations.map((item, index) => (
              <button type="button" key={item} aria-pressed={situation === index} onClick={() => selectMoment(index)}>{HOTSPOT_LABELS[scene.id][index]}</button>
            ))}
          </div>}

          {studioOpen && <fieldset className="situation-list">
            <legend>Your selected moment</legend>
            {scene.situations.map((item, index) => (
              <label key={item} className={`situation-option${situation === index ? " is-picked" : ""}`}>
                <input type="radio" name="room-situation" checked={situation === index} onChange={() => selectMoment(index)} />
                <span className="situation-check" aria-hidden="true">{situation === index ? "✓" : ""}</span><span>{item}</span>
              </label>
            ))}
          </fieldset>}

          {demo ? <div className="demo-studio">
            {studioOpen ? <>
              <p className="demo-studio-label">LOCAL MEME PREVIEW · {scene.name.toUpperCase()}</p>
              <div className={`demo-composer-image${boldCaption ? " is-bold-caption" : " is-plain-caption"}`}>
                <Image src={scene.image} alt={`${scene.name} animal meme preview`} fill sizes="(max-width: 900px) 100vw, 700px" />
                <span>{previewCaption.top || "YOUR TOP LINE"}</span><span>{previewCaption.bottom || "YOUR PUNCHLINE"}</span>
              </div>
              <label htmlFor="demo-prompt">Your editable scene</label>
              <textarea id="demo-prompt" value={prompt} onChange={(event) => setPromptEdits((current) => ({ ...current, [promptKey]: event.target.value }))} rows={2} />
              <label htmlFor="demo-topline">Top caption</label>
              <input ref={topCaptionRef} id="demo-topline" value={editedCaption.top} onChange={(event) => updateCaption({ ...editedCaption, top: event.target.value })} maxLength={80} />
              <label htmlFor="demo-bottomline">Bottom caption</label>
              <input id="demo-bottomline" value={editedCaption.bottom} onChange={(event) => updateCaption({ ...editedCaption, bottom: event.target.value })} maxLength={100} />
              <div className="demo-studio-tools">
                <button type="button" className="demo-tool-button" aria-pressed={!boldCaption} onClick={() => setBoldCaption((current) => !current)}>{boldCaption ? "Switch to clean type" : "Switch to meme type"}</button>
                <button type="button" className="demo-tool-button" onClick={resetCaption}>Reset caption</button>
              </div>
              <p>This preview stays here. Your words aren’t saved or published.</p>
              <button type="button" className="make-here-button" onClick={() => { setComposerOpen(false); requestAnimationFrame(() => hotspotRefs.current[situation]?.focus()); }}>Return to the scene</button>
            </> : <>
              <p className="demo-studio-label">TAKE THIS MOMENT INTO YOUR STUDIO</p>
              <p className="demo-context-preview">“{prompt}”</p>
              <button type="button" className="make-here-button" onClick={() => { setComposerOpen(true); requestAnimationFrame(() => topCaptionRef.current?.focus()); }}>Make a meme here <Icon name="arrow" /></button>
            </>}
          </div> : <Link className="make-here-button" href={`/create?${studioQuery.toString()}`}>Make a meme here <Icon name="arrow" /></Link>}
        </div>
      </div>
      {!demo && <p className="explore-footnote"><span aria-hidden="true">✦</span> Your selected setting follows you into the studio and back to this room.</p>}
    </section>
  );
}
