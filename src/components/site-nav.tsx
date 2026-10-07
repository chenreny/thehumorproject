import Link from "next/link";
import { Icon } from "@/components/icon";

export function SiteNav({ signedIn, active }: { signedIn: boolean; active?: "feed" | "create" | "profile" }) {
  return <nav aria-label="Main navigation" className="site-nav sticky top-0 z-40 mb-8 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 py-5 md:grid-cols-[1fr_auto_1fr] md:py-6">
    <Link href="/" aria-label="The Humor Project home" className="flex w-fit items-center gap-2.5"><Icon name="spark" className="hidden !size-6 min-[420px]:block" /><span className="text-lg font-semibold tracking-[-0.055em] sm:text-xl">humor<span className="ml-1.5 hidden font-normal text-accent min-[360px]:inline">project</span></span></Link>
    <div className="nav-pill col-span-2 row-start-2 flex w-fit items-center justify-self-center rounded-full border border-accent-border bg-white p-1 text-xs font-medium md:col-span-1 md:col-start-2 md:row-start-1">
      <Link href="/" aria-current={active === "feed" ? "page" : undefined} className={`rounded-full px-5 py-2 ${active === "feed" ? "bg-accent-selected text-accent-strong" : "text-accent hover:text-accent-strong"}`}>Discover</Link>
      <Link href="/create" aria-current={active === "create" ? "page" : undefined} className={`rounded-full px-5 py-2 ${active === "create" ? "bg-accent-selected text-accent-strong" : "text-accent hover:text-accent-strong"}`}>Studio</Link>
      {signedIn && <Link href="/profile" aria-current={active === "profile" ? "page" : undefined} className={`rounded-full px-5 py-2 md:hidden ${active === "profile" ? "bg-accent-selected text-accent-strong" : "text-accent"}`}>Profile</Link>}
    </div>
    <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-3 text-xs font-medium md:col-start-3 md:gap-5 md:text-sm">
      {signedIn ? <>
        <Link href="/profile" className="hidden text-accent hover:text-foreground md:block">Profile</Link>
        <form action="/auth/logout" method="post"><button className="whitespace-nowrap text-accent hover:text-foreground">Sign out</button></form>
      </> : <a href="/auth/login" aria-label="Sign in with Google" className="whitespace-nowrap text-accent hover:text-foreground">Sign in</a>}
      <Link href="/create" className="button-primary !min-h-9 !gap-1.5 !px-3 !py-2 !text-xs sm:!min-h-10 sm:!px-4 sm:!text-sm"><Icon name="plus" className="!size-3.5" />Make a meme</Link>
    </div>
  </nav>;
}
