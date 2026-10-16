"use client";

import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import { MemeImage } from "@/components/meme-image";
import { imageFileError } from "@/lib/media";
import { MEME_TEMPLATES, getTemplate, templateSrc } from "@/lib/templates";
import { generateCaption } from "./actions";
import { TOPICS, topicLabel } from "@/lib/generation";
import styles from "./create-page.module.css";

export function GenerationForm({ dailyPrompt, useDaily, initialPrompt = "", initialTopic = "Campus", initialTemplateId = "", available, signedIn }: { dailyPrompt: string; useDaily: boolean; initialPrompt?: string; initialTopic?: string; initialTemplateId?: string; available: boolean; signedIn: boolean }) {
  const [prompt, setPrompt] = useState(initialPrompt || (useDaily ? dailyPrompt : ""));
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState<"templates" | "upload" | "generate">("templates");
  const [templateId, setTemplateId] = useState<string>(getTemplate(initialTemplateId)?.id ?? "disaster-girl");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(true);
  const [uploadPreview, setUploadPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const editor = useRef<HTMLElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
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
    ? template.id === "woman-yelling-at-cat"
      ? "object-contain p-3"
      : `object-cover ${template.id === "surprised-pikachu" || template.id === "monkey-puppet" ? "object-bottom" : "object-center"}`
    : "object-contain p-3";
  const filtered = MEME_TEMPLATES;
  const generatedMeme = mode === "generate" && showResult && !pending && state.captionId && state.meme
    ? { captionId: state.captionId, meme: state.meme }
    : null;

  function chooseTemplate(id: string) {
    setTemplateId(id);
    setShowResult(false);
    // Bring the stacked editor into view on tablet and phone layouts.
    if (window.matchMedia("(max-width: 1200px)").matches) {
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
    if (fileInput.current) fileInput.current.value = "";
    setShowResult(false);
  }

  function setImageFile(file: File | null) {
    const error = imageFileError(file);
    setImageError(error ?? "");
    setSelectedFile(error ? null : file);
    setShowResult(false);
    setUploadPreview(file && !error ? URL.createObjectURL(file) : "");
    if (error && fileInput.current) fileInput.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0] ?? null;
    if (!file) return;
    if (fileInput.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.current.files = transfer.files;
    }
    setImageFile(file);
  }

  function clearImage() {
    if (fileInput.current) fileInput.current.value = "";
    setSelectedFile(null);
    setUploadPreview("");
    setImageError("");
    setShowResult(false);
  }

  return <>
  <form action={action} onReset={(event) => event.preventDefault()} onSubmit={() => setShowResult(true)} aria-busy={pending} className={styles.form}>
    <input type="hidden" name="template_id" value={mode === "templates" ? template?.id ?? "" : ""} />
    <input type="hidden" name="image_source" value={mode === "generate" ? "generated" : "provided"} />
    <section aria-labelledby="choose-title" tabIndex={0} className={`${styles.choices} min-w-0`}>
      <div className={styles.choiceTop}>
        <h2 id="choose-title" className={styles.choiceHeading}>Start with a picture</h2>
        <p className={styles.choiceIntro}>Choose a template, upload a picture, or create one with AI.</p>
        <div className={styles.modeTabs} role="group" aria-label="Picture source">
          <button type="button" aria-pressed={mode === "templates"} disabled={pending} onClick={() => chooseMode("templates")} className={styles.modeButton}>Templates</button>
          <button type="button" aria-pressed={mode === "upload"} disabled={pending} onClick={() => chooseMode("upload")} className={styles.modeButton}><Icon name="upload" />Upload picture</button>
          <button type="button" aria-pressed={mode === "generate"} disabled={pending} onClick={() => chooseMode("generate")} className={styles.modeButton}><Icon name="spark" />Generate with AI</button>
        </div>
      </div>
      {mode === "templates" ? <>
        <div className={styles.galleryLabel}><span>All templates</span><span>{filtered.length} ideas</span></div>
        {filtered.length ? <ul className={styles.templateGrid}>{filtered.map((item) => <li key={item.id}>
          <button type="button" disabled={pending} aria-pressed={templateId === item.id} aria-label={`Use ${item.name}`} onClick={() => chooseTemplate(item.id)} className={`${styles.templateTile} template-tile group block w-full text-left disabled:opacity-50`}>
            <div className={`${styles.templateArt} template-art relative isolate aspect-video w-full overflow-hidden rounded-2xl bg-accent-surface`}>
              <Image src={templateSrc(item)} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" className={`${item.id === "surprised-pikachu" || item.id === "monkey-puppet" || item.id === "woman-yelling-at-cat" ? "object-cover object-bottom" : "object-cover object-center"} ${item.id === "woman-yelling-at-cat" ? "origin-bottom scale-[1.2]" : ""} mix-blend-multiply`} />
              <span className={`${styles.templateCheck} absolute bottom-3 right-3 grid size-7 place-items-center rounded-full transition-opacity ${templateId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}><Icon name={templateId === item.id ? "check" : "plus"} className="!size-3.5" /></span>
            </div>
            <div className={styles.templateMeta}><p>{item.name}</p><span>{item.category}</span></div>
          </button>
        </li>)}</ul> : null}
      </> : mode === "upload" ? <div className={styles.uploadPanel}>
        <div onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className={`${styles.dropzone} ${selectedFile ? styles.dropzoneSelected : ""}`}>
          <div aria-hidden="true" className={styles.uploadIcon}><Icon name="upload" className="!size-6" /></div>
          <h3>{selectedFile ? "Picture ready to use" : "Bring your own picture"}</h3>
          <p id="image-help">Drop an image here, or choose a file.<br />JPEG, PNG, or WebP · up to 3 MB</p>
          <input ref={fileInput} id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-required="true" disabled={pending} aria-describedby="image-help" className="peer sr-only" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
          <label htmlFor="image" className={`${styles.chooseFile} peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-strong`}>{selectedFile ? "Choose another" : "Choose file"}</label>
          {imageError && <p role="alert" className={styles.fileError}>{imageError}</p>}
        </div>
        {selectedFile && <div className={styles.fileSummary}>
          <span className={styles.fileThumb}>{uploadPreview && <Image src={uploadPreview} alt="" fill unoptimized sizes="48px" />}</span>
          <span className={styles.fileInfo}><strong>{selectedFile.name}</strong><small>Picture ready to use</small></span>
          <button type="button" onClick={clearImage} disabled={pending} aria-label="Remove selected picture" className={styles.removeFile}>×</button>
        </div>}
      </div> : <div className={styles.modeSurface}>
        <div aria-hidden="true" className="mb-6 grid size-14 place-items-center rounded-2xl bg-white text-accent-strong"><Icon name="spark" className="!size-6" /></div>
        <h3>Dream up a meme picture</h3>
        <p>Describe a moment in the prompt and AI will create an original image. The result will appear in the preview.</p>
      </div>}
    </section>

    <section aria-label="Selected picture preview" className={styles.previewPanel}>
      <div className={styles.previewHeader}><span>{template ? "Your selected picture" : selectedFile ? "Your uploaded picture" : mode === "generate" ? "AI picture preview" : "Picture preview"}</span>{template && <span className={styles.previewBadge}>{template.name}</span>}{selectedFile && <span className={styles.previewBadge}>Your picture</span>}</div>
      <div className={`${styles.previewArt} ${preview ? "" : styles.previewEmpty}`}>
        {preview ? <Image src={preview} alt={template ? `Selected template: ${template.name}` : "Your selected meme photo"} fill unoptimized={mode === "upload"} sizes="(max-width: 900px) 100vw, 50vw" className={`${previewImageClass} mix-blend-multiply`} /> : mode === "generate" && generatedMeme ? <div ref={generatedPreview} className="absolute inset-0"><MemeImage className="h-full aspect-auto rounded-none" src={`/captions/${generatedMeme.captionId}/image`} description={generatedMeme.meme.imageDescription} top={generatedMeme.meme.setup} bottom={generatedMeme.meme.punchline} /></div> : <div className={styles.previewEmptyCopy}><Icon name={mode === "generate" ? "spark" : "image"} className="!size-8" /><p>{mode === "generate" ? "Your original image will appear here" : "Choose a picture to see it here"}</p></div>}
      </div>
      {!template && <div className={styles.previewFoot}><span>{selectedFile ? selectedFile.name : mode === "generate" ? "AI will create an image from your prompt." : "Select a template or upload a picture to get started."}</span></div>}
    </section>

    <section ref={editor} id="meme-editor" aria-labelledby="editor-title" className={`${styles.editor} studio-editor min-w-0 scroll-mt-36`}>
      <div className={styles.editorHeader}><div><span className={styles.editorEyebrow}>ADD YOUR MOMENT</span><h2 id="editor-title">{mode === "generate" ? "Describe the picture" : "What happened?"}</h2><p>{mode === "generate" ? "We’ll make the picture and write a caption." : "Give us the details you’d tell the group chat."}</p></div><Icon name="spark" /></div>
      <div className="space-y-4">
        <div><label htmlFor="topic" className="mb-2 block text-xs font-medium text-foreground">Pick your territory</label><select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="field !py-2.5" disabled={pending}>{TOPICS.map((item) => <option key={item} value={item}>{topicLabel(item)}</option>)}</select></div>
        <div><div className="mb-2 flex flex-wrap justify-between gap-2"><label htmlFor="prompt" className="text-xs font-medium text-foreground">{mode === "generate" ? "Describe the image and moment" : "Give it some context"}</label><button type="button" onClick={() => setPrompt(dailyPrompt)} disabled={pending} className="text-[11px] text-accent underline decoration-accent-border-strong underline-offset-4">Use today’s inspiration</button></div>
          <textarea id="prompt" name="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={10} maxLength={500} rows={4} disabled={pending} aria-describedby="prompt-help" placeholder={mode === "generate" ? "What should the image show? A specific campus or NYC moment works best." : "What’s the situation? A specific campus or NYC moment works best."} className="field resize-y !leading-relaxed" />
          <p id="prompt-help" className="mt-1.5 text-right text-[10px] text-accent">{prompt.length}/500</p>
        </div>
        {signedIn ? <>
          <button disabled={pending || !available || prompt.trim().length < 10 || (mode !== "generate" && !preview)} className="button-primary w-full"><Icon name="spark" />{pending ? mode === "generate" ? "Creating an image & writing your meme…" : "Reading the image & writing your meme…" : "Generate & publish meme →"}</button>
          <p className="text-center text-[10px] leading-relaxed text-accent">10 attempts per rolling 24 hours, including unsuccessful attempts.</p>
        </> : <div className="border-t border-accent-border pt-4"><p className="mb-3 text-xs leading-relaxed text-accent">Sign in to turn this into a meme.</p><a href="/auth/login?next=/create" className="button-primary w-full">Continue with Google</a></div>}
      </div>
    </section>
  </form>
  {showResult && !pending && state.message && !state.captionId && <div ref={resultPreview} role="status" className={`${styles.resultMessage} mx-auto mt-8 w-full max-w-xl rounded-2xl border p-5 text-sm leading-relaxed`}>
    {state.message}
  </div>}
  </>;
}
