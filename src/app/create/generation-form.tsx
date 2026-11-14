"use client";

import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
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
  const [scenePrompt, setScenePrompt] = useState("");
  const [topic, setTopic] = useState(initialTopic);
  const [mode, setMode] = useState<"templates" | "upload" | "generate">("templates");
  const [templateId, setTemplateId] = useState<string>(getTemplate(initialTemplateId)?.id ?? "animal-library-cat");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(true);
  const focusPromptOnEditor = useRef(false);
  const [uploadPreview, setUploadPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const editor = useRef<HTMLElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const resultPreview = useRef<HTMLDivElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const promptInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => () => { if (uploadPreview) URL.revokeObjectURL(uploadPreview); }, [uploadPreview]);
  const [state, action, pending] = useActionState(generateCaption, { message: "" });
  useEffect(() => {
    if (!showResult || pending || (!state.message && !state.captionId)) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    (state.captionId ? editor.current : resultPreview.current)?.scrollIntoView({ behavior, block: "center" });
    if (state.captionId) successHeading.current?.focus({ preventScroll: true });
  }, [showResult, pending, state.message, state.captionId]);
  useEffect(() => {
    if (!focusPromptOnEditor.current || showResult) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    editor.current?.scrollIntoView({ behavior, block: "center" });
    promptInput.current?.focus({ preventScroll: true });
    focusPromptOnEditor.current = false;
  }, [showResult]);
  const template = mode === "templates" ? getTemplate(templateId) : undefined;
  const preview = template ? templateSrc(template) : mode === "upload" ? uploadPreview : "";
  const previewImageClass = template
    ? template.id === "woman-yelling-at-cat"
      ? "object-contain p-3"
      : template.id === "monkey-puppet"
        ? "object-contain"
      : `object-cover ${template.id === "surprised-pikachu" ? "object-bottom" : "object-center"}`
    : "object-contain p-3";
  const previewCropClass = template?.id === "surprised-pikachu"
    ? styles.pikachuCrop
    : "";
  const featuredTemplateIds = ["animal-library-cat", "animal-nyc-dog", "animal-dorm-cat", "animal-dining-cat", "animal-campus-raccoon", "hide-the-pain-harold"];
  const filtered = [...MEME_TEMPLATES].sort((a, b) => {
    const aIndex = featuredTemplateIds.indexOf(a.id);
    const bIndex = featuredTemplateIds.indexOf(b.id);
    return (aIndex === -1 ? featuredTemplateIds.length : aIndex) - (bIndex === -1 ? featuredTemplateIds.length : bIndex);
  });
  const isStudyCat = template?.id === "animal-library-cat";
  const publishedMeme = showResult && !pending && state.captionId && state.meme
    ? { captionId: state.captionId, meme: state.meme }
    : null;

  function makeAnotherMeme() {
    setShowResult(false);
    setPrompt("");
    setImageError("");
    focusPromptOnEditor.current = true;
  }

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
    <div className={styles.modeBar} role="group" aria-label="Picture source">
      <button type="button" aria-pressed={mode === "templates"} disabled={pending} onClick={() => chooseMode("templates")} className={styles.modeButton}><Icon name="image" /><span><strong>Templates</strong></span></button>
      <button type="button" aria-pressed={mode === "upload"} disabled={pending} onClick={() => chooseMode("upload")} className={styles.modeButton}><Icon name="upload" /><span><strong>Upload picture</strong></span></button>
      <button type="button" aria-pressed={mode === "generate"} disabled={pending} onClick={() => chooseMode("generate")} className={styles.modeButton}><Icon name="spark" /><span><strong>Generate with AI</strong></span></button>
    </div>
    <section aria-labelledby="choose-title" tabIndex={0} className={`${styles.choices} min-w-0`}>
      <div className={styles.choiceTop}>
        <span className={styles.stepLabel}><span>01</span> START WITH A PICTURE</span>
        <h2 id="choose-title" className={styles.choiceHeading}>{mode === "templates" ? "Pick your character." : mode === "upload" ? "Bring your own moment." : "Picture something new."}</h2>
        <p className={styles.choiceIntro}>{mode === "templates" ? "A familiar face. A whole new story." : mode === "upload" ? "That photo deserves a better caption." : "Describe a scene. Make it a meme."}</p>
      </div>
      {mode === "templates" ? <>
        <div className={styles.galleryLabel}><span>Choose a face for your story</span><span>{filtered.length} pictures</span></div>
        {filtered.length ? <ul className={styles.templateGrid}>{filtered.map((item) => <li key={item.id}>
          <button type="button" disabled={pending} aria-pressed={templateId === item.id} aria-label={`Use ${item.name}`} onClick={() => chooseTemplate(item.id)} className={`${styles.templateTile} template-tile group block w-full text-left disabled:opacity-50`}>
            <div className={`${styles.templateArt} template-art relative isolate aspect-video w-full overflow-hidden rounded-2xl bg-accent-surface`}>
              <Image src={templateSrc(item)} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" className={`${item.id === "monkey-puppet" ? "object-contain" : item.id === "surprised-pikachu" || item.id === "woman-yelling-at-cat" ? "object-cover object-bottom" : "object-cover object-center"} ${item.id === "woman-yelling-at-cat" ? "origin-bottom scale-[1.2]" : ""}`} />
              <span className={`${styles.templateCheck} absolute bottom-3 right-3 grid size-7 place-items-center rounded-full transition-opacity ${templateId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}><Icon name={templateId === item.id ? "check" : "plus"} className="!size-3.5" /></span>
            </div>
            <div className={styles.templateMeta}><p>{item.name}</p><span>{item.category}</span></div>
          </button>
        </li>)}</ul> : null}
      </> : mode === "upload" ? <div className={styles.uploadPanel}>
        <div onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className={`${styles.dropzone} ${selectedFile ? styles.dropzoneSelected : ""}`}>
          <div aria-hidden="true" className={styles.uploadIcon}><Icon name="upload" className="!size-6" /></div>
          <h3>{selectedFile ? "Picture ready to use" : "Choose a photo"}</h3>
          <p id="image-help">Your camera roll has good material.</p>
          <input ref={fileInput} id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" aria-required="true" disabled={pending} aria-describedby="image-help" className="peer sr-only" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
          <label htmlFor="image" className={styles.chooseFile}><span className="sr-only">{selectedFile ? "Choose another photo" : "Choose a photo to upload"}</span></label>
          {imageError && <p role="alert" className={styles.fileError}>{imageError}</p>}
        </div>
        <p className={styles.uploadHint}>JPG, PNG or WebP · up to 3 MB</p>
        {selectedFile && <div className={styles.fileSummary}>
          <span className={styles.fileThumb}>{uploadPreview && <Image src={uploadPreview} alt="" fill unoptimized sizes="48px" />}</span>
          <span className={styles.fileInfo}><strong>{selectedFile.name}</strong><small>Picture ready to use</small></span>
          <button type="button" onClick={clearImage} disabled={pending} aria-label="Remove selected picture" className={styles.removeFile}>×</button>
        </div>}
      </div> : <div className={`${styles.modeSurface} ${styles.generatedSurface}`}>
        <label htmlFor="image-prompt" className={styles.generatePromptLabel}>Describe your picture</label>
        <textarea id="image-prompt" name="image_prompt" value={scenePrompt} onChange={(event) => setScenePrompt(event.target.value)} required minLength={10} maxLength={500} rows={5} disabled={pending} placeholder="A raccoon with a backpack outside the library at midnight..." className={`${styles.generatePrompt} field`} />
        <div className={styles.generatePromptMeta}><button type="button" className={styles.exampleLink} onClick={() => setScenePrompt("A raccoon with a backpack outside the library at midnight, carrying three overdue books.")}>Use an example ↗</button><span>{scenePrompt.length}/500</span></div>
        <p className={styles.generateHelp}>Tell us who, where, and what’s happening. The more specific, the better.</p>
        <button type="submit" disabled={pending || !available || scenePrompt.trim().length < 10 || prompt.trim().length < 10} className={`${styles.previewGenerate} button-primary`}><Icon name="spark" />{pending ? "Creating your picture & meme…" : "Generate picture & meme →"}</button>
        <small className={styles.mockupNote}>Add context and pick your territory, then generate.</small>
      </div>}
    </section>

    <section aria-label="Selected picture preview" className={styles.previewPanel}>
      <div className={styles.previewHeader}><span>{publishedMeme ? "YOUR FINISHED MEME" : "YOUR MASTERPIECE, IN PROGRESS"}</span><span className={styles.liveBadge}><span aria-hidden="true">●</span> LIVE PREVIEW</span></div>
      <div className={styles.previewCard}><div className={`${styles.previewArt} ${preview || publishedMeme ? "" : styles.previewEmpty}`}>
        {publishedMeme ? <div className="absolute inset-0"><MemeImage className="h-full aspect-auto rounded-none" src={`/captions/${publishedMeme.captionId}/image`} description={publishedMeme.meme.imageDescription} top={publishedMeme.meme.setup} bottom={publishedMeme.meme.punchline} /></div> : preview ? <div className={`${styles.previewImageWrap} ${previewCropClass}`}><Image src={preview} alt={template ? `Selected template: ${template.name}` : "Your selected meme photo"} fill unoptimized={mode === "upload"} sizes="(max-width: 900px) 100vw, 50vw" className={previewImageClass} /></div> : <div className={styles.previewEmptyCopy}><Icon name="image" className="!size-8" /><p>{mode === "upload" ? "Your picture goes here." : mode === "generate" ? "Your idea starts here." : "Choose a picture to see it here"}</p>{mode === "upload" ? <small>Choose a photo to see it in your meme.</small> : mode === "generate" ? <small>{scenePrompt.trim().length >= 10 ? "Add your context, then make your picture." : "Describe your scene, then make your picture."}</small> : null}</div>}
        {!publishedMeme && isStudyCat && <div className={styles.sampleCaption} aria-label="Sample caption on picture"><span>ME: A QUICK STUDY BREAK</span><span>ALSO ME: THREE HOURS LATER</span></div>}
      </div>
      <div className={styles.previewFoot}><span>{publishedMeme ? "Made by you, just now." : isStudyCat || mode === "upload" && !selectedFile || mode === "generate" && !scenePrompt.trim() ? "Campus, after hours. ✳" : selectedFile ? "Your moment, your story. ✳" : mode === "generate" ? "Your idea, taking shape. ✳" : template ? template.name : "Your picture goes here."}</span></div></div>
      {!publishedMeme && <p className={styles.previewNote}>{mode === "upload" && !selectedFile ? "Waiting for your picture" : mode === "generate" ? "AI picture preview" : isStudyCat ? "Sample caption · Your context will inspire the final meme." : "Your picture · Add context to make it yours."}</p>}
    </section>

    {publishedMeme ? <section ref={editor} aria-labelledby="success-title" role="status" className={`${styles.editor} ${styles.successPanel} min-w-0`}>
      <span aria-hidden="true" className={styles.successCheck}><Icon name="check" className="!size-7" /></span>
      <span className={styles.successKicker}>PUBLISHED SUCCESSFULLY</span>
      <h2 ref={successHeading} id="success-title" tabIndex={-1}>Your meme is live!</h2>
      <p>Nice work. It’s saved in your gallery and ready to share.</p>
      <Link href="/memes" className={`${styles.successPrimary} button-primary`}>View your meme <span aria-hidden="true">↗</span></Link>
      <button type="button" onClick={makeAnotherMeme} className={styles.successSecondary}>Make another meme</button>
      <div className={styles.successStamp}><span aria-hidden="true">✓</span> Created just now<br />Find this meme again in Your recent attempts.</div>
    </section> : <section ref={editor} id="meme-editor" aria-labelledby="editor-title" className={`${styles.editor} studio-editor min-w-0 scroll-mt-36`}>
      <div className={styles.editorHeader}><div><h2 id="editor-title">What happened?</h2><p>Give the picture a place and a moment. We’ll use your details to write the joke.</p></div></div>
      <div className={styles.editorFields}>
        <div className={styles.territoryField}><label htmlFor="topic" className="mb-2 block text-xs font-medium text-foreground">Pick your territory</label><select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="field !py-2.5" disabled={pending}>{TOPICS.map((item) => <option key={item} value={item}>{topicLabel(item)}</option>)}</select><p className={styles.territoryHint}>Set the scene: campus, work, the city, or wherever it happened.</p></div>
        <div className={styles.contextField}><label htmlFor="prompt" className="mb-2 block text-xs font-medium text-foreground">Give it some context</label>
          <textarea ref={promptInput} id="prompt" name="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={10} maxLength={500} rows={4} disabled={pending} aria-describedby="prompt-help" placeholder="Where were you? What were you trying to do? What actually happened?" className="field resize-y !leading-relaxed" />
          <p className={styles.contextNudge}>A place + a tiny detail + the unexpected outcome is plenty.</p>
          <div className={styles.contextActions}><button type="button" onClick={() => setPrompt(dailyPrompt)} disabled={pending}>✧&nbsp; Try a sample caption</button><span id="prompt-help">{prompt.length}/500</span></div>
        </div>
        {signedIn ? <>
          {mode !== "generate" && <button disabled={pending || !available || prompt.trim().length < 10 || !preview} className="button-primary w-full"><Icon name="spark" />{pending ? "Reading the image & writing your meme…" : "Generate & publish meme →"}</button>}
          <p className="text-center text-[10px] leading-relaxed text-accent">10 attempts per rolling 24 hours, including unsuccessful attempts.</p>
        </> : <div className="border-t border-accent-border pt-4"><p className="mb-3 text-xs leading-relaxed text-accent">Sign in to turn this into a meme.</p><a href="/auth/login?next=/create" className="button-primary w-full">Continue with Google</a></div>}
      </div>
    </section>}
  </form>
  {showResult && !pending && state.message && !state.captionId && <div ref={resultPreview} role="status" className={`${styles.resultMessage} mx-auto mt-8 w-full max-w-xl rounded-2xl border p-5 text-sm leading-relaxed`}>
    {state.message}
  </div>}
  </>;
}
