"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { imageFileError } from "@/lib/media";
import { MEME_TEMPLATES, TEMPLATE_CATEGORIES, getTemplate, templateSrc } from "@/lib/templates";
import { generateCaption } from "./actions";
import { TOPICS } from "@/lib/generation";

export function GenerationForm({ dailyPrompt, useDaily, available, signedIn }: { dailyPrompt: string; useDaily: boolean; available: boolean; signedIn: boolean }) {
  const [prompt, setPrompt] = useState(useDaily ? dailyPrompt : "");
  const [topic, setTopic] = useState("Campus");
  const [mode, setMode] = useState<"templates" | "upload">("templates");
  const [templateId, setTemplateId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All templates");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(true);
  const [uploadPreview, setUploadPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const editor = useRef<HTMLElement>(null);
  useEffect(() => () => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); }, [uploadPreview]);
  const [state, action, pending] = useActionState(generateCaption, { message: "" });
  const template = mode === "templates" ? getTemplate(templateId) : undefined;
  const preview = template ? templateSrc(template) : mode === "upload" ? uploadPreview : "";
  const previewImageClass = template
    ? `object-cover ${template.id === "surprised-pikachu" || template.id === "monkey-puppet" || template.id === "woman-yelling-at-cat" ? "object-bottom" : "object-center"} ${template.id === "woman-yelling-at-cat" ? "origin-bottom scale-[1.1]" : ""}`
    : "object-contain p-3";
  const filtered = MEME_TEMPLATES.filter((item) => (category === "All templates" || item.category === category)
    && `${item.name} ${item.tags} ${item.vibe}`.toLowerCase().includes(query.trim().toLowerCase()));

  function chooseTemplate(id: string) {
    setTemplateId(id);
    setShowResult(false);
    // Keep the desktop board in place; bring the editor into view on phones.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      editor.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }
  }

  return <form action={action} onReset={(event) => event.preventDefault()} onSubmit={() => setShowResult(true)} aria-busy={pending} className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-14">
    <input type="hidden" name="template_id" value={template?.id ?? ""} />
    <section aria-labelledby="choose-title" className="min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="choose-title" className="section-label">Find your starting point</h2>
        <div className="inline-flex rounded-full bg-accent-selected p-1 text-xs font-medium">
          <button type="button" aria-pressed={mode === "templates"} disabled={pending} onClick={() => { setMode("templates"); setUploadPreview(""); setSelectedFile(null); setImageError(""); setShowResult(false); }} className={`rounded-full px-4 py-2 transition-colors ${mode === "templates" ? "bg-white text-accent-strong shadow-sm" : "text-accent"}`}>Templates</button>
          <button type="button" aria-pressed={mode === "upload"} disabled={pending} onClick={() => { setMode("upload"); setImageError(""); setShowResult(false); }} className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${mode === "upload" ? "bg-white text-accent-strong shadow-sm" : "text-accent"}`}><Icon name="upload" className="!size-3" />Upload a photo</button>
        </div>
      </div>
      {mode === "templates" ? <>
        <div className="mb-7 flex items-center gap-3">
          <label className="relative min-w-0 flex-1"><span className="sr-only">Search templates</span><Icon name="search" className="absolute left-4 top-3.5 text-accent" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} disabled={pending} placeholder="Search a face, a feeling…" className="field !rounded-full !bg-transparent !pl-10" /></label>
          <label><span className="sr-only">Template category</span><select value={category} onChange={(event) => setCategory(event.target.value)} disabled={pending} className="field !w-auto !rounded-full !bg-transparent !px-3 !text-xs">{TEMPLATE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        {filtered.length ? <ul className="columns-2 gap-5 sm:columns-3 lg:columns-2 xl:columns-3">{filtered.map((item) => <li key={item.id} className="mb-6 break-inside-avoid">
          <button type="button" disabled={pending} aria-pressed={templateId === item.id} aria-label={`Use ${item.name}`} onClick={() => chooseTemplate(item.id)} className="template-tile group block w-full text-left disabled:opacity-50">
            <div className="template-art relative isolate aspect-video w-full overflow-hidden rounded-2xl bg-accent-surface">
              <Image src={templateSrc(item)} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" className={`${item.id === "surprised-pikachu" || item.id === "monkey-puppet" || item.id === "woman-yelling-at-cat" ? "object-cover object-bottom" : "object-cover object-center"} ${item.id === "woman-yelling-at-cat" ? "origin-bottom scale-[1.2]" : ""} mix-blend-multiply`} />
              <span className={`absolute bottom-3 right-3 grid size-7 place-items-center rounded-full bg-foreground text-white transition-opacity ${templateId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}><Icon name={templateId === item.id ? "check" : "plus"} className="!size-3.5" /></span>
            </div>
            <div className="flex items-start justify-between gap-2 px-0.5 pt-3"><p className="text-xs font-medium leading-relaxed text-accent">{item.name}</p><span className="hidden pt-0.5 text-[10px] text-accent sm:block">{item.category}</span></div>
          </button>
        </li>)}</ul> : <div role="status" className="rounded-2xl border border-dashed border-accent-border py-14 text-center"><p className="text-sm font-medium text-foreground">No templates for that search.</p><p className="mt-2 text-xs text-accent">Try “awkward”, “waiting”, or “chaos”.</p><button type="button" onClick={() => { setQuery(""); setCategory("All templates"); }} className="mt-4 text-xs font-medium text-accent underline underline-offset-4">Clear filters</button></div>}
        <div className="mt-2 flex flex-wrap justify-between gap-3 border-t border-accent-border pt-5 text-[11px] text-accent"><p>Classic templates via <a href="https://imgflip.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">Imgflip</a></p><span aria-live="polite">{filtered.length} starting points · One original take</span></div>
      </> : <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-accent-border-strong bg-accent-surface p-6 text-center sm:p-10">
        <div aria-hidden="true" className="mb-6 grid size-14 place-items-center rounded-2xl bg-white text-accent"><Icon name="image" className="!size-6" /></div>
        <label htmlFor="image" className="mb-2 block text-xl font-normal tracking-tight text-foreground">Pick your meme photo</label>
        <p id="image-help" className="mb-6 max-w-sm text-sm leading-relaxed text-accent">A camera roll moment, a dramatic pet, your chaotic desk.<br /><span className="text-xs">JPEG, PNG, or WebP · up to 3 MB</span></p>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-required="true" disabled={pending} aria-describedby="image-help" className="mx-auto block w-full max-w-sm min-w-0 text-xs text-accent file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-3 file:font-medium file:text-accent-strong" onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          const error = imageFileError(file);
          setImageError(error ?? "");
          setSelectedFile(error ? null : file);
          setShowResult(false);
          setUploadPreview(file && !error ? URL.createObjectURL(file) : "");
          if (error) event.target.value = "";
        }} />
        {selectedFile && <p className="mt-4 break-all text-xs text-accent">Current photo: {selectedFile.name}</p>}
        {imageError && <p role="alert" className="mt-3 text-sm font-medium text-accent-strong">{imageError}</p>}
      </div>}
    </section>

    <section ref={editor} id="meme-editor" aria-labelledby="editor-title" className="studio-editor panel min-w-0 scroll-mt-36 border-accent-border p-5 lg:sticky lg:top-28">
      <div className="mb-4 flex items-center justify-between"><h2 id="editor-title" className="text-sm font-medium">Caption studio</h2><Icon name="spark" className="text-accent" /></div>
      <div className="relative mb-3 aspect-[2/1] overflow-hidden rounded-2xl bg-accent-surface">{preview ? <Image src={preview} alt={template ? `Selected template: ${template.name}` : "Your selected meme photo"} fill unoptimized={mode === "upload"} sizes="(max-width: 1024px) 100vw, 330px" className={`${previewImageClass} mix-blend-multiply`} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"><Icon name="image" className="!size-6 text-accent" /><p className="text-xs text-accent">Choose an image to start.</p></div>}</div>
      {preview && <p className="mb-4 break-words text-xs text-accent">{template?.name ?? selectedFile?.name}</p>}
      <div className="space-y-4">
        <div><label htmlFor="topic" className="mb-2 block text-xs font-medium text-foreground">Pick your territory</label><select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="field !py-2.5" disabled={pending}>{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div><div className="mb-2 flex flex-wrap justify-between gap-2"><label htmlFor="prompt" className="text-xs font-medium text-foreground">Give it some context</label><button type="button" onClick={() => setPrompt(dailyPrompt)} disabled={pending} className="text-[11px] text-accent underline decoration-accent-border-strong underline-offset-4">Use today’s inspiration</button></div>
          <textarea id="prompt" name="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={10} maxLength={500} rows={3} disabled={pending} aria-describedby="prompt-help" placeholder="What’s the situation? A specific campus or NYC moment works best." className="field resize-y !leading-relaxed" />
          <p id="prompt-help" className="mt-1.5 text-right text-[10px] text-accent">{prompt.length}/500</p>
        </div>
        <p className="text-[11px] leading-relaxed text-accent">Image and context are sent to OpenAI. Your published meme is visible to signed-in members; your written prompt stays private.</p>
        {signedIn ? <>
          <button disabled={pending || !available || !preview} className="button-primary w-full"><Icon name="spark" />{pending ? "Reading the image & writing your meme…" : "Generate & publish meme →"}</button>
          <p className="text-center text-[10px] leading-relaxed text-accent">5 attempts per rolling 24 hours, including unsuccessful attempts.</p>
        </> : <div className="border-t border-accent-border pt-4"><p className="mb-3 text-xs leading-relaxed text-accent">Sign in to turn this into a meme.</p><a href="/auth/login?next=/create" className="button-primary w-full">Continue with Google</a></div>}
        {showResult && !pending && state.message && <div role="status" className="rounded-xl bg-accent-surface p-4 text-xs leading-relaxed text-accent-strong"><p>{state.message}</p>{state.captionId && <Link href={`/captions/${state.captionId}`} className="mt-3 inline-block font-medium underline underline-offset-4">See your meme & share it →</Link>}</div>}
      </div>
    </section>
  </form>;
}
