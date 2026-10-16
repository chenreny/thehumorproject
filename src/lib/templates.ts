export const TEMPLATE_CATEGORIES = ["All templates", "Animal photos", "Reactions", "Chaos", "Waiting"] as const;

// Only these local assets may be submitted to the generator. Never treat a
// client-provided template ID as a filesystem path or a remote image URL.
export const MEME_TEMPLATES = [
  { id: "surprised-pikachu", name: "Surprised Pikachu", category: "Reactions", tags: "shock surprised unexpected", vibe: "When you really should have seen it coming", source: "https://i.imgflip.com/2kbn1e.jpg", file: "meme-templates/surprised-pikachu.jpg" },
  { id: "this-is-fine", name: "This Is Fine", category: "Chaos", tags: "fire stress finals deadlines dorm", vibe: "Everything is absolutely under control", source: "https://i.imgflip.com/wxica.jpg", file: "meme-templates/this-is-fine.jpg" },
  { id: "monkey-puppet", name: "Monkey Puppet", category: "Reactions", tags: "awkward side eye guilty", vibe: "That painfully awkward moment", source: "https://i.imgflip.com/2gnnjh.jpg", file: "meme-templates/monkey-puppet.jpg" },
  { id: "disaster-girl", name: "Disaster Girl", category: "Chaos", tags: "fire chaos trouble smug", vibe: "A little chaos, as a treat", source: "https://i.imgflip.com/23ls.jpg", file: "meme-templates/disaster-girl.jpg" },
  { id: "waiting-skeleton", name: "Waiting Skeleton", category: "Waiting", tags: "waiting subway slow bored", vibe: "Any minute now. Any. Minute.", source: "https://i.imgflip.com/2fm6x.jpg", file: "meme-templates/waiting-skeleton.jpg" },
  { id: "hide-the-pain-harold", name: "Hide the Pain Harold", category: "Reactions", tags: "smile tired coffee pain budget", vibe: "Smiling through the student budget", source: "https://i.imgflip.com/gk5el.jpg", file: "meme-templates/hide-the-pain-harold.jpg" },
  { id: "woman-yelling-at-cat", name: "Woman Yelling at Cat", category: "Chaos", tags: "cat argument drama dinner", vibe: "Two very different sides of the story", source: "https://i.imgflip.com/345v97.jpg", file: "meme-templates/woman-yelling-at-cat.jpg" },
  { id: "one-does-not-simply", name: "One Does Not Simply", category: "Reactions", tags: "impossible difficult rules college", vibe: "It sounded so easy in theory", source: "https://i.imgflip.com/1bij.jpg", file: "meme-templates/one-does-not-simply.jpg" },
  { id: "animal-library-cat", name: "Late-night library cat", category: "Animal photos", tags: "animal cat library studying finals laptop", vibe: "One more page turned into sunrise", source: "Local photo", file: "room/animals/library-cat.webp" },
  { id: "animal-campus-raccoon", name: "Campus side-quest raccoon", category: "Animal photos", tags: "animal raccoon campus backpack class", vibe: "A tiny walk became a full campus adventure", source: "Local photo", file: "room/animals/campus-raccoon.webp" },
  { id: "animal-nyc-dog", name: "Subway pizza dog", category: "Animal photos", tags: "animal dog nyc subway pizza train", vibe: "The train ETA says two minutes again", source: "Local photo", file: "room/animals/subway-dog.webp" },
  { id: "animal-dorm-cat", name: "Dorm blanket cat", category: "Animal photos", tags: "animal cat dorm bed laundry cozy", vibe: "Laundry has claimed a second bed", source: "Local photo", file: "room/animals/dorm-cat.webp" },
  { id: "animal-dining-cat", name: "Dining hall pancake cat", category: "Animal photos", tags: "animal cat dining hall pancakes snack", vibe: "One last plate, then one more", source: "Local photo", file: "room/animals/dining-cat.webp" },
] as const;

export type MemeTemplate = (typeof MEME_TEMPLATES)[number];
export function getTemplate(id: unknown): MemeTemplate | undefined {
  return typeof id === "string" ? MEME_TEMPLATES.find((template) => template.id === id) : undefined;
}
export function templateSrc(template: MemeTemplate): string {
  return `/${template.file}`;
}
