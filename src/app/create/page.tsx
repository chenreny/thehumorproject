import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dailyScene } from "@/lib/generation";
import { SiteNav } from "@/components/site-nav";
import { GenerationForm } from "./generation-form";

export const maxDuration = 60;
export const metadata = { title: "Make a meme · The Humor Project" };

type GenerationHistory = { id: string; prompt: string; model: string; status: string; created_at: string; captions: { id: string } | null };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ daily?: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/?next=/create");
  const { daily } = await searchParams;
  const { data: history, error } = user ? await supabase.from("generation_requests")
    .select("id, prompt, model, status, created_at, captions(id)").order("created_at", { ascending: false }).limit(10).returns<GenerationHistory[]>()
    : { data: null, error: null };
  const configured = Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return <main className="page-shell"><div className="page-width"><SiteNav signedIn={Boolean(user)} active="create" />
    <header className="mb-10 flex flex-wrap items-end justify-between gap-5 pt-5 sm:mb-12"><div><p className="eyebrow mb-4">The creation studio</p><h1 className="display-title text-4xl sm:text-5xl">A familiar face.<br /><span className="text-[hsl(var(--primary))]">A new punchline.</span></h1></div><p className="max-w-xs text-sm leading-relaxed text-accent">Choose an image. Tell us the moment.<br />Let AI connect the two.</p></header>
    {!configured && <p role="status" className="panel mb-6 p-4 text-sm text-accent">The generator is being connected. You can browse templates in the meantime.</p>}
    <GenerationForm dailyPrompt={dailyScene()} useDaily={daily === "1"} available={configured} signedIn={Boolean(user)} />
    {user && <section aria-labelledby="history-title" className="mt-12 border-t border-accent-border pt-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><h2 id="history-title" className="text-lg font-semibold">Your recent attempts</h2><p className="text-xs text-accent">Private to you · Your last 10 prompts</p></div>
      {error ? <p role="alert" className="text-accent-strong">Your history couldn’t load. Please refresh.</p> : history?.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{history.map((item) => <li key={item.id} className="flex flex-col rounded-2xl border border-accent-border bg-transparent p-5"><div className="mb-3 flex justify-between gap-3 text-xs text-accent"><span>{new Date(item.created_at).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })}</span><span>{item.status === "pending" ? "Awaiting result" : item.status}</span></div><p className="break-words text-sm leading-relaxed text-accent">{item.prompt}</p>{item.captions?.id && <Link href={`/captions/${item.captions.id}`} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">View meme →</Link>}</li>)}</ul> : <div className="panel p-6 text-sm text-accent">Your first prompt belongs here.</div>}
    </section>}
    <footer className="mt-12 flex flex-wrap justify-between gap-4 border-t border-accent-border py-6 text-xs text-accent"><Link href="/" className="hover:text-accent">← Back to the feed</Link><p>You bring the moment. AI brings the caption.</p></footer>
  </div></main>;
}
