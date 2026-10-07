export const TEMPLATE_CATEGORIES = ["All templates", "Reactions", "Chaos", "Waiting"] as const;

// Only these local assets may be submitted to the generator. Never treat a
// client-provided template ID as a filesystem path or a remote image URL.
export const MEME_TEMPLATES = [
  { id: "surprised-pikachu", name: "Surprised Pikachu", category: "Reactions", tags: "shock surprised unexpected", vibe: "When you really should have seen it coming", source: "https://i.imgflip.com/2kbn1e.jpg" },
  { id: "this-is-fine", name: "This Is Fine", category: "Chaos", tags: "fire stress finals deadlines dorm", vibe: "Everything is absolutely under control", source: "https://i.imgflip.com/wxica.jpg" },
  { id: "monkey-puppet", name: "Monkey Puppet", category: "Reactions", tags: "awkward side eye guilty", vibe: "That painfully awkward moment", source: "https://i.imgflip.com/2gnnjh.jpg" },
  { id: "disaster-girl", name: "Disaster Girl", category: "Chaos", tags: "fire chaos trouble smug", vibe: "A little chaos, as a treat", source: "https://i.imgflip.com/23ls.jpg" },
  { id: "waiting-skeleton", name: "Waiting Skeleton", category: "Waiting", tags: "waiting subway slow bored", vibe: "Any minute now. Any. Minute.", source: "https://i.imgflip.com/2fm6x.jpg" },
  { id: "hide-the-pain-harold", name: "Hide the Pain Harold", category: "Reactions", tags: "smile tired coffee pain budget", vibe: "Smiling through the student budget", source: "https://i.imgflip.com/gk5el.jpg" },
  { id: "woman-yelling-at-cat", name: "Woman Yelling at Cat", category: "Chaos", tags: "cat argument drama dinner", vibe: "Two very different sides of the story", source: "https://i.imgflip.com/345v97.jpg" },
  { id: "one-does-not-simply", name: "One Does Not Simply", category: "Reactions", tags: "impossible difficult rules college", vibe: "It sounded so easy in theory", source: "https://i.imgflip.com/1bij.jpg" },
] as const;

export type MemeTemplate = (typeof MEME_TEMPLATES)[number];
export function getTemplate(id: unknown): MemeTemplate | undefined {
  return typeof id === "string" ? MEME_TEMPLATES.find((template) => template.id === id) : undefined;
}
export function templateSrc(template: MemeTemplate): string {
  return `/meme-templates/${template.id}.jpg`;
}
