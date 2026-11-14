"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEventHandler, type Ref } from "react";

export function CityBanner({
  active,
  className,
  homeHref = "/",
  memeLinkRef,
  onExplore,
}: {
  active: "city" | "wall" | "studio" | "profile";
  className?: string;
  homeHref?: string;
  memeLinkRef?: Ref<HTMLAnchorElement>;
  onExplore?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!accountOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAccountOpen(false);
      accountButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  return <header className={`city-banner${className ? ` ${className}` : ""}`}>
    <nav className="city-banner-nav" aria-label="Main navigation">
      <Link href={homeHref} className="city-banner-brand" aria-label="The Humor Project home" onClick={onExplore}><Image src="/room/radio-v5.webp" alt="" width={92} height={62} className="city-banner-brand-image" /></Link>
      <div className="city-banner-center">
        <Link href={homeHref} aria-current={active === "city" ? "page" : undefined} onClick={onExplore}>Explore the city</Link>
        <Link ref={memeLinkRef} href="/memes" aria-current={active === "wall" ? "page" : undefined}>Meme wall</Link>
        <Link href="/create" aria-current={active === "studio" ? "page" : undefined} prefetch={false}>Studio</Link>
      </div>
      <div className="city-banner-account">
        <Link className="city-banner-create" href="/create" prefetch={false}><span aria-hidden="true">＋</span> Create a meme</Link>
        <div className="city-banner-account-menu" ref={accountRef}>
          <button ref={accountButtonRef} type="button" className="city-banner-profile" aria-label="Your account" aria-expanded={accountOpen} aria-controls="city-banner-account-panel" onClick={() => setAccountOpen((open) => !open)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20v-2.2a6.5 6.5 0 0 1 13 0V20" /></svg>
          </button>
          <div className="city-banner-account-panel" id="city-banner-account-panel" hidden={!accountOpen}>
            <Link href="/profile" className="city-banner-account-preview" aria-current={active === "profile" ? "page" : undefined} onClick={() => setAccountOpen(false)}><strong>Your account</strong><span>Preview profile</span></Link>
            <form action="/auth/logout" method="post">
              <button type="submit" className="city-banner-sign-out"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H5v16h5M14 8l4 4-4 4M9 12h9" /></svg><span>Sign out</span></button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  </header>;
}
