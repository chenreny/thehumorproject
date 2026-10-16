import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dailyScene, TOPICS } from "@/lib/generation";
import { SiteNav } from "@/components/site-nav";
import { GenerationForm } from "./generation-form";
import { roomScene } from "@/lib/room-scenes";
import { getTemplate } from "@/lib/templates";
import styles from "./create-page.module.css";

export const maxDuration = 60;
export const metadata = { title: "Make a meme · The Humor Project" };

type GenerationHistory = { id: string; prompt: string; status: string; created_at: string; captions: { id: string } | null };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ daily?: string | string[]; topic?: string | string[]; prompt?: string | string[]; scene?: string | string[]; template?: string | string[] }> }) {
  const params = await searchParams;
  const single = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
  const topicParam = single(params.topic);
  const promptParam = single(params.prompt);
  const dailyParam = single(params.daily);
  const sceneParam = roomScene(single(params.scene))?.id;
  const templateParam = getTemplate(single(params.template))?.id;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    const safeQuery = new URLSearchParams();
    if (topicParam && TOPICS.includes(topicParam as (typeof TOPICS)[number])) safeQuery.set("topic", topicParam);
    if (promptParam && promptParam.trim().length >= 10 && promptParam.length <= 500) safeQuery.set("prompt", promptParam);
    if (dailyParam === "1") safeQuery.set("daily", "1");
    if (sceneParam) safeQuery.set("scene", sceneParam);
    if (templateParam) safeQuery.set("template", templateParam);
    const destination = `/create${safeQuery.size ? `?${safeQuery.toString()}` : ""}`;
    redirect(`/?next=${encodeURIComponent(destination)}`);
  }
  const initialTopic = topicParam && TOPICS.includes(topicParam as (typeof TOPICS)[number]) ? topicParam : "Campus";
  const initialPrompt = promptParam && promptParam.trim().length >= 10 && promptParam.length <= 500 ? promptParam : "";
  const daily = dailyParam;
  const { data: history, error } = user ? await supabase.from("generation_requests")
    .select("id, prompt, status, created_at, captions(id)").order("created_at", { ascending: false }).limit(10).returns<GenerationHistory[]>()
    : { data: null, error: null };
  const configured = Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return <main className={`${styles.shell} page-shell create-page`}>
    <SiteNav signedIn={Boolean(user)} active="create" />
    <section className={styles.experience} aria-label="Meme creation studio">
      <header className={styles.hero}>
        <p className={styles.heroEyebrow}>MEME STUDIO</p>
        <h1>Make a meme</h1>
        <p>Pick a picture. Add your take.</p>
      </header>
      {!configured && <p role="status" className={styles.status}>The generator is being connected. You can browse templates in the meantime.</p>}
      <div className={styles.formFrame}><GenerationForm key={`${initialTopic}:${initialPrompt}:${templateParam ?? ""}:${daily === "1"}`} dailyPrompt={dailyScene()} useDaily={daily === "1" && !initialPrompt} initialPrompt={initialPrompt} initialTopic={initialTopic} initialTemplateId={templateParam} available={configured} signedIn={Boolean(user)} /></div>
    </section>
    <div className={`${styles.belowStage} page-width`}>
    {user && <details aria-labelledby="history-title" className={styles.history}>
      <summary className={styles.historyHeader}>
        <span className={styles.historyIntro}>
          <span id="history-title" role="heading" aria-level={2}>Your recent attempts</span>
        </span>
        <span className={styles.historyOpenLabel}><span className={styles.historyOpenText}>Open gallery</span><span className={styles.historyCloseText}>Close gallery</span></span>
      </summary>
      <div className={styles.historyContent}>
        {error ? <p role="alert" className="text-[#ffad99]">Your history couldn’t load. Please refresh.</p> : history?.length ? <ul className={styles.historyGrid}>{history.map((item, index) => <li key={item.id} className={styles.historyCard}>
          <div className={styles.historyImage}>
            {item.captions?.id ? <Image src={`/captions/${item.captions.id}/image`} alt="Generated meme" width={320} height={160} unoptimized loading="lazy" /> : <div className={styles.historyImageEmpty}><span aria-hidden="true">✦</span><span>{item.status === "pending" ? "Image in progress" : "No image saved"}</span></div>}
            <span className={styles.historyStatus}>{item.status === "pending" ? "In progress" : item.status.replaceAll("_", " ")}</span>
          </div>
          <div className={styles.historyCardBody}>
            <div className={styles.historyMeta}><span>{new Date(item.created_at).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })}</span><span>{index + 1} / {history.length}</span></div>
            <p>{item.prompt}</p>
            {item.captions?.id ? <Link href={`/captions/${item.captions.id}`} className={styles.historyViewLink}>View meme <span aria-hidden="true">→</span></Link> : <span className={styles.historyNoImage}>Prompt saved</span>}
          </div>
        </li>)}</ul> : <div className={styles.historyEmpty}>Your first prompt belongs here. Your attempts will appear in this private gallery.</div>}
      </div>
    </details>}
    </div>
  </main>;
}
