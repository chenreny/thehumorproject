"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { MemeImage } from "@/components/meme-image";
import { imageFileError } from "@/lib/media";
import { MEME_TEMPLATES, TEMPLATE_CATEGORIES, getTemplate, templateSrc } from "@/lib/templates";
import { generateCaption } from "./actions";
import { TOPICS } from "@/lib/generation";

export function GenerationForm({ dailyPrompt, useDaily, available, signedIn }: { dailyPrompt: string; useDaily: boolean; available: boolean; signedIn: boolean }) {
  const [prompt, setPrompt] = useState(useDaily ? dailyPrompt : "");
  const [topic, setTopic] = useState("Campus");
  const [mode, setMode] = useState<"templates" | "upload" | "generate">("templates");
  const [templateId, setTemplateId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All templates");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(true);
  const [uploadPreview, setUploadPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const editor = useRef<HTMLElement>(null);
  const resultPreview = useRef<HTMLDivElement>(null);
  const generatedPreview = useRef<HTMLDivElement>(null);
  useEffect(() => () => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); }, [uploadPreview]);
  const [state, action, pending] = useActionState(generateCaption, { message: "" });
  useEffect(() => {
    if (!showResult || pending || (!state.message && !state.captionId)) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    (state.captionId ? generatedPreview.current : resultPreview.current)?.scrollIntoView({ behavior, block: "center" });
  }, [showResult, pending, state.message, state.captionId]);
  const template = mode === "templates" ? getTemplate(templateId) : undefined;
  const preview = template ? templateSrc(template) : mode === "upload" ? uploadPreview : "";
  const previewImageClass = template
    ? `object-cover ${template.id === "surprised-pikachu" || template.id === "monkey-puppet" || template.id === "woman-yelling-at-cat" ? "object-bottom" : "object-center"} ${template.id === "woman-yelling-at-cat" ? "origin-bottom scale-[1.1]" : ""}`
    : "object-contain p-3";
  const filtered = MEME_TEMPLATES.filter((item) => (category === "All templates" || item.category === category)
    && `${item.name} ${item.tags} ${item.vibe}`.toLowerCase().includes(query.trim().toLowerCase()));
  const generatedMeme = mode === "generate" && showResult && !pending && state.captionId && state.meme
    ? { captionId: state.captionId, meme: state.meme }
    : null;

  function chooseTemplate(id: string) {
    setTemplateId(id);
    setShowResult(false);
    // Keep the desktop board in place; bring the editor into view on phones.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      editor.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }
  }

  function chooseMode(nextMode: "templates" | "upload" | "generate") {
    if (nextMode === mode) return;
    setMode(nextMode);
    setTemplateId("");
    setSelectedFile(null);
    setUploadPreview("");
    setImageError("");
    setShowResult(false);
  }

  return <>
  <form action={action} onReset={(event) => event.preventDefault()} onSubmit={() => setShowResult(true)} aria-busy={pending} className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-14">
    <input type="hidden" name="template_id" value={mode === "templates" ? template?.id ?? "" : ""} />
    <input type="hidden" name="image_source" value={mode === "generate" ? "generated" : "provided"} />
    <section aria-labelledby="choose-title" className="min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="choose-title" className="section-label">Find your starting point</h2>
        <div className="inline-flex rounded-full bg-accent-selected p-1 text-xs font-medium">
          <button type="button" aria-pressed={mode === "templates"} disabled={pending} onClick={() => chooseMode("templates")} className={`rounded-full px-4 py-2 transition-colors ${mode === "templates" ? "bg-white text-accent-strong shadow-sm" : "text-accent"}`}>Templates</button>
          <button type="button" aria-pressed={mode === "upload"} disabled={pending} onClick={() => chooseMode("upload")} className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${mode === "upload" ? "bg-white text-accent-strong shadow-sm" : "text-accent"}`}><Icon name="upload" className="!size-3" />Upload a photo</button>
          <button type="button" aria-pressed={mode === "generate"} disabled={pending} onClick={() => chooseMode("generate")} className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${mode === "generate" ? "bg-white text-accent-strong shadow-sm" : "text-accent"}`}><Icon name="spark" className="!size-3" />Generate an image</button>
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
      </> : mode === "upload" ? <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-accent-border-strong bg-accent-surface p-6 text-center sm:p-10">
        <div aria-hidden="true" className="mb-6 grid size-14 place-items-center rounded-2xl bg-white text-accent"><Icon name="image" className="!size-6" /></div>
        <label htmlFor="image" className="mb-2 block text-xl font-normal tracking-tight text-foreground">Pick your meme photo</label>
        <p id="image-help" className="mb-6 max-w-sm text-sm leading-relaxed text-accent">A camera roll moment, a dramatic pet, your chaotic desk.<br /><span className="text-xs">JPEG, PNG, or WebP · up to 3 MB</span></p>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-required="true" disabled={pending} aria-describedby="image-help" className="peer sr-only" onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          const error = imageFileError(file);
          setImageError(error ?? "");
          setSelectedFile(error ? null : file);
          setShowResult(false);
          setUploadPreview(file && !error ? URL.createObjectURL(file) : "");
          if (error) event.target.value = "";
        }} />
        <label htmlFor="image" className="button-secondary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-strong peer-disabled:cursor-not-allowed peer-disabled:opacity-50">Choose file</label>
        {selectedFile && <p className="mt-4 break-all text-xs text-accent">Current photo: {selectedFile.name}</p>}
        {imageError && <p role="alert" className="mt-3 text-sm font-medium text-accent-strong">{imageError}</p>}
      </div> : <div className={`flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-accent-border-strong bg-accent-surface ${generatedMeme ? "h-96 overflow-hidden p-0" : "p-8 text-center sm:p-12"}`}>
        {generatedMeme ? <div ref={generatedPreview} className="h-full w-full overflow-hidden rounded-3xl"><MemeImage className="h-full aspect-auto rounded-none" src={`/captions/${generatedMeme.captionId}/image`} description={generatedMeme.meme.imageDescription} top={generatedMeme.meme.setup} bottom={generatedMeme.meme.punchline} /></div> : <>
          <h3 className="text-xl font-normal tracking-tight text-foreground">Dream up a meme photo</h3>
          <div aria-hidden="true" className="mb-6 mt-6 grid size-14 place-items-center rounded-2xl bg-white text-accent"><Icon name="spark" className="!size-6" /></div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-accent">Describe a moment. AI will create an original image, then write a caption for it.</p>
        </>}
      </div>}
    </section>

    <section ref={editor} id="meme-editor" aria-labelledby="editor-title" className="studio-editor min-w-0 scroll-mt-36 rounded-3xl bg-white p-5 lg:sticky lg:top-28">
      <div className="mb-4 flex items-center justify-between"><h2 id="editor-title" className="text-sm font-medium">Meme studio</h2><Icon name="spark" className="text-accent" /></div>
        {preview && <div className="relative mb-3 aspect-[2/1] overflow-hidden rounded-2xl bg-accent-surface"><Image src={preview} alt={template ? `Selected template: ${template.name}` : "Your selected meme photo"} fill unoptimized={mode === "upload"} sizes="(max-width: 1024px) 100vw, 330px" className={`${previewImageClass} mix-blend-multiply`} /></div>}
      {preview && <p className="mb-4 break-words text-xs text-accent">{template?.name ?? selectedFile?.name}</p>}
      <div className="space-y-4">
        <div><label htmlFor="topic" className="mb-2 block text-xs font-medium text-foreground">Pick your territory</label><select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="field !py-2.5" disabled={pending}>{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div><div className="mb-2 flex flex-wrap justify-between gap-2"><label htmlFor="prompt" className="text-xs font-medium text-foreground">{mode === "generate" ? "Describe the image and moment" : "Give it some context"}</label><button type="button" onClick={() => setPrompt(dailyPrompt)} disabled={pending} className="text-[11px] text-accent underline decoration-accent-border-strong underline-offset-4">Use today’s inspiration</button></div>
          <textarea id="prompt" name="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={10} maxLength={500} rows={3} disabled={pending} aria-describedby="prompt-help" placeholder={mode === "generate" ? "What should the image show? A specific campus or NYC moment works best." : "What’s the situation? A specific campus or NYC moment works best."} className="field resize-y !leading-relaxed" />
          <p id="prompt-help" className="mt-1.5 text-right text-[10px] text-accent">{prompt.length}/500</p>
        </div>
        {signedIn ? <>
          <button disabled={pending || !available || (mode !== "generate" && !preview)} className="button-primary w-full"><Icon name="spark" />{pending ? mode === "generate" ? "Creating an image & writing your meme…" : "Reading the image & writing your meme…" : "Generate & publish meme →"}</button>
          <p className="text-center text-[10px] leading-relaxed text-accent">10 attempts per rolling 24 hours, including unsuccessful attempts.</p>
        </> : <div className="border-t border-accent-border pt-4"><p className="mb-3 text-xs leading-relaxed text-accent">Sign in to turn this into a meme.</p><a href="/auth/login?next=/create" className="button-primary w-full">Continue with Google</a></div>}
      </div>
    </section>
  </form>
  {showResult && !pending && state.captionId && <div ref={resultPreview} className="mx-auto mt-8 flex w-full justify-center">
    <Link href={`/captions/${state.captionId}`} className="button-primary !bg-[hsl(var(--primary))] hover:!bg-accent-strong">See your meme & share it<Icon name="arrow" /></Link>
  </div>}
  {showResult && !pending && state.message && !state.captionId && <div ref={resultPreview} role="status" className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-accent-border bg-accent-surface p-5 text-sm leading-relaxed text-accent-strong">
    {state.message}
  </div>}
  </>;
}
