import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getMyVotes } from "@/lib/captions";
import { dailyScene } from "@/lib/generation";
import { MEME_TEMPLATES, templateSrc } from "@/lib/templates";
import { SiteNav } from "@/components/site-nav";
import { CaptionCard } from "@/components/caption-card";
import { Icon } from "@/components/icon";
import { SignInScreen } from "@/components/sign-in-screen";

export default async function Home({ searchParams }: { searchParams: Promise<{ auth_error?: string; sort?: string; page?: string; next?: string }> }) {
  await connection();
  const params = await searchParams;
  const sort = params.sort === "week" ? "week" : "new";
  const page = Math.min(1000, Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0));
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <SignInScreen next={params.next} authError={params.auth_error} />;
  const feed = await getFeed(sort, page);
  const myVotes = user ? await getMyVotes(feed.captions.map((c) => c.id)) : { votes: {}, error: false };
  return <main className="page-shell"><div className="page-width">
    <SiteNav signedIn={Boolean(user)} active="feed" />
    {params.auth_error && <p role="alert" className="panel mb-8 p-4 text-sm text-accent">Sign in could not be completed. Please try again.</p>}
    <header className={`relative isolate overflow-hidden py-8 text-center ${user ? "sm:py-7" : "sm:pb-16 sm:pt-10"}`}>
      <div aria-hidden="true" className="hero-orb pointer-events-none absolute inset-x-0 -top-20 -z-10 mx-auto h-[520px] max-w-4xl" />
      <p className="eyebrow mb-5">A little campus chaos. A different point of view.</p>
      <h1 className={`display-title ${user ? "text-[clamp(2.8rem,4vw,3.5rem)]" : "text-[clamp(2.8rem,6.4vw,6rem)]"}`}>Life happens.<br /><span className="text-[hsl(var(--primary))]">Make it a meme.</span></h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-accent sm:text-base">The NYC moments. The dorm room drama.<br />Your images, AI punchlines, and the group chat’s vote.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/create" className="button-primary"><Icon name="spark" />Open the studio</Link><a href="#feed" className="button-secondary">Explore the feed<Icon name="arrow" /></a></div>
    </header>
    <aside className="mb-12 flex flex-col gap-3 rounded-2xl border border-accent-border bg-accent-surface p-5 text-sm lg:flex-row lg:items-center lg:gap-6">
      <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-accent"><Icon name="spark" />Today’s starting point</div><p className="flex-1 leading-relaxed text-accent">{dailyScene()}</p><Link href="/create?daily=1" className="flex shrink-0 items-center gap-2 text-xs font-medium text-accent">Make it yours<Icon name="arrow" /></Link>
    </aside>
    <section id="feed" aria-labelledby="feed-title" className="scroll-mt-32">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h2 id="feed-title" className="text-xl font-normal tracking-tight">Made for the group chat.</h2><p className="mt-1.5 text-xs text-accent">Vote on the AI punchlines. One vote per meme; change your mind anytime.</p></div>
        <nav aria-label="Feed order" className="flex gap-1 text-xs font-medium">
          <Link href="/?sort=new" aria-current={sort === "new" ? "page" : undefined} className={`rounded-full px-4 py-2.5 ${sort === "new" ? "bg-accent-selected text-accent-strong" : "text-accent hover:bg-white"}`}>Newest</Link>
          <Link href="/?sort=week" aria-current={sort === "week" ? "page" : undefined} className={`rounded-full px-4 py-2.5 ${sort === "week" ? "bg-accent-selected text-accent-strong" : "text-accent hover:bg-white"}`}>Top this week</Link>
        </nav>
      </div>
    {myVotes.error && <p role="alert" className="mb-5 text-sm text-accent-strong">We couldn’t load your saved votes. Refresh before voting again.</p>}
      {feed.error ? <div role="alert" className="panel p-8 text-foreground">The feed couldn’t load. <Link href="/" className="font-medium text-accent underline underline-offset-4">Try again</Link>.</div>
        : feed.captions.length ? <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{feed.captions.map((caption) => <li key={caption.id} className="min-w-0"><CaptionCard caption={caption} signedIn={Boolean(user)} myVote={myVotes.votes[caption.id]} /></li>)}</ul>
        : <div><div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-accent-border px-5 py-5"><p className="text-sm text-accent">{page > 0 ? "You’re all caught up. Find a new starting point below." : sort === "week" ? "A fresh week, a blank canvas. Make the first meme." : "The feed starts with you. Find a face for your next punchline."}</p><Link href="/create" className="flex items-center gap-2 text-xs font-medium text-accent">Create the first one<Icon name="arrow" /></Link></div><ul className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">{MEME_TEMPLATES.slice(0, 4).map((template) => {
          const imagePosition = template.id === "surprised-pikachu" || template.id === "monkey-puppet" ? "object-bottom" : "object-center";
          return <li key={template.id}><Link href="/create" className="group block"><div className="relative aspect-video overflow-hidden rounded-2xl bg-accent-surface"><Image src={templateSrc(template)} alt={template.name} fill sizes="(max-width: 1024px) 50vw, 330px" className={`object-cover ${imagePosition} mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]`} /></div><div className="mt-3 flex items-center justify-between text-xs text-accent"><span>{template.name}</span><Icon name="arrow" className="!size-3" /></div></Link></li>;
        })}</ul><p className="mt-6 text-[11px] text-accent">Starter images · Your published memes will live here.</p></div>}
      <nav aria-label="Feed pages" className="my-8 flex justify-between text-sm font-medium text-accent">
        {page > 0 ? <Link href={`/?sort=${sort}&page=${page - 1}`} className="hover:underline">← Previous</Link> : <span />}
        {feed.captions.length === 30 && page < 1000 && <Link href={`/?sort=${sort}&page=${page + 1}`} className="hover:underline">Next →</Link>}
      </nav>
    </section>
    <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-accent-border py-6 text-[11px] text-accent"><span>The Humor Project</span><span>Campus → city → group chat</span></footer>
  </div></main>;
}
