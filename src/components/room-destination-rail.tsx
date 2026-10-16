"use client";

import Image from "next/image";
import { ROOM_SCENES, type RoomSceneId } from "@/lib/room-scenes";

export function RoomDestinationRail({ onSelect, active = true }: { onSelect: (scene: RoomSceneId) => void; active?: boolean }) {
  return (
    <section className="room-destination-rail" aria-label="Room destinations" inert={!active}>
      <div className="destination-rail-heading">
        <p>TAKE A LITTLE DETOUR</p>
        <span>Five corners of the night</span>
      </div>
      <ul>
        {ROOM_SCENES.map((scene) => (
          <li key={scene.id}>
            <button type="button" onClick={() => onSelect(scene.id)} aria-label={`Explore ${scene.name}: ${scene.mood}`}>
              <span className="destination-photo"><Image src={scene.image} alt="" fill sizes="150px" /></span>
              <span className="destination-copy"><span>{scene.mark}</span><strong>{scene.name}</strong></span>
              <span className="destination-arrow" aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
