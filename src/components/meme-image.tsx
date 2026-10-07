"use client";

import Image from "next/image";
import { useState } from "react";

export function MemeImage({ src, description, top, bottom }: { src?: string; description: string; top: string; bottom: string }) {
  const [failed, setFailed] = useState(false);
  return <figure className="relative isolate aspect-square w-full min-w-0 overflow-hidden rounded-2xl bg-zinc-900">
    {src && !failed ? <Image src={src} alt={description} fill unoptimized sizes="(max-width: 768px) 100vw, 380px" className="object-contain" onError={() => setFailed(true)} />
      : <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white">The photo couldn’t load. Refresh to try again.</p>}
    <figcaption className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between text-center">
      <p className="meme-caption bg-gradient-to-b from-black/65 to-transparent px-3 pb-10 pt-3">{top}</p>
      <p className="meme-caption bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10">{bottom}</p>
    </figcaption>
  </figure>;
}
