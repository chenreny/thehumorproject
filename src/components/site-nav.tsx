"use client";

import Link from "next/link";
import Image from "next/image";

export function SiteNav({ signedIn, active, onRadioClick }: { signedIn: boolean; active?: "home" | "feed" | "create" | "profile"; onRadioClick?: () => void }) {
  const cityBanner = active === "create" || active === "profile";
  return <nav aria-label="Main navigation" className="site-nav sticky top-0 z-40 -mx-4 mb-4 flex min-h-[68px] items-center justify-between gap-x-5 px-4 sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
    <div className="nav-left">
      {onRadioClick ? <button type="button" aria-label="Choose a channel" aria-haspopup="dialog" className="radio-logo" onClick={onRadioClick}><Image src="/room/radio-v5.webp" alt="" width={92} height={62} preload /></button> : <Link href="/" aria-label="The Humor Project home" className="radio-logo"><Image src="/room/radio-v5.webp" alt="" width={58} height={40} /></Link>}
      {active === "create" && <span className="studio-brand-name">THE HUMOR<br />PROJECT <span aria-hidden="true">✳</span></span>}
    </div>
    {cityBanner ? <div className="nav-center">
      <Link href="/" aria-current={undefined}>Explore the city</Link>
      <Link href="/memes">Meme wall</Link>
      <Link href="/create" aria-current={active === "create" ? "page" : undefined}>Studio</Link>
    </div> : <div className="nav-center">
      <Link href="/" aria-current={active === "home" ? "page" : undefined}>Home</Link>
      <Link href="/memes" aria-current={active === "feed" ? "page" : undefined}>Browse</Link>
      <Link href="/create">Create</Link>
    </div>}
    <div className="nav-account">
      {cityBanner && signedIn ? <>
        <Link href="/create" className="home-create-pill"><span aria-hidden="true">＋</span> Create a meme</Link>
        <Link href="/profile" className="home-profile-pill" aria-current={active === "profile" ? "page" : undefined}>Profile</Link>
        <form action="/auth/logout" method="post"><button type="submit">Sign out</button></form>
      </> : signedIn ? <><Link href="/profile" aria-current={active === "profile" ? "page" : undefined}>Profile</Link><form action="/auth/logout" method="post"><button type="submit">Sign out</button></form></> : <a href="/auth/login" aria-label="Sign in with Google">Sign in</a>}
    </div>
  </nav>;
}
