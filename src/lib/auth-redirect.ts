const roomSceneIds = ["library", "campus", "subway", "dorm", "dining"] as const;
const animalTemplateIds = ["animal-library-cat", "animal-campus-raccoon", "animal-nyc-dog", "animal-dorm-cat", "animal-dining-cat"] as const;

export function safeAuthDestination(value: string | null | undefined, fallback = "/members") {
  if (!value) return fallback;
  if (["/", "/memes", "/create", "/profile", "/members", "/welcome"].includes(value)
    || /^\/captions\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return value;
  // Preserve only safe Browse filters or studio context across sign-in.
  if (value.startsWith("/?") && !value.startsWith("//")) {
    try {
      const url = new URL(value, "https://the-humor-project.invalid");
      if (url.pathname !== "/" || url.searchParams.getAll("view").length > 1 || url.searchParams.getAll("location").length > 1 || url.searchParams.getAll("scene").length > 1 || [...url.searchParams.keys()].some((key) => key !== "view" && key !== "location" && key !== "scene")) return fallback;
      const view = url.searchParams.get("view");
      let location = url.searchParams.get("location");
      const scene = url.searchParams.get("scene");
      if (scene) {
        if (view || location || !roomSceneIds.includes(scene as (typeof roomSceneIds)[number])) return fallback;
        location = scene === "subway" ? "EastVillage" : "Campus";
      } else if (view !== "feed" || (location && !["Campus", "Ktown", "EastVillage"].includes(location))) return fallback;
      return `/?view=feed${location ? `&location=${location}` : ""}`;
    } catch { return fallback; }
  }
  if (!value.startsWith("/create?") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://the-humor-project.invalid");
    if (url.pathname !== "/create" || url.searchParams.getAll("topic").length > 1 || url.searchParams.getAll("prompt").length > 1 || url.searchParams.getAll("daily").length > 1 || url.searchParams.getAll("scene").length > 1 || url.searchParams.getAll("template").length > 1) return fallback;
    const params = new URLSearchParams();
    const topic = url.searchParams.get("topic");
    const prompt = url.searchParams.get("prompt");
    const daily = url.searchParams.get("daily");
    const scene = url.searchParams.get("scene");
    const template = url.searchParams.get("template");
    if (topic && ["Campus", "Ktown", "EastVillage"].includes(topic)) params.set("topic", topic);
    if (prompt && prompt.trim().length >= 10 && prompt.length <= 500) params.set("prompt", prompt);
    if (daily === "1") params.set("daily", "1");
    if (scene && roomSceneIds.includes(scene as (typeof roomSceneIds)[number])) params.set("scene", scene);
    if (template && animalTemplateIds.includes(template as (typeof animalTemplateIds)[number])) params.set("template", template);
    return `/create${params.size ? `?${params.toString()}` : ""}`;
  } catch {
    return fallback;
  }
}
