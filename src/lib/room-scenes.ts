import type { Topic } from "@/lib/generation";

export const ROOM_SCENES = [
  {
    id: "library", name: "Library", topic: "Campus", mark: "01", image: "/room/animals/library-cat.webp", template: "animal-library-cat", mood: "Quiet stacks, loud deadlines.",
    situations: ["One more page turned into sunrise.", "The study group made a group chat about studying.", "I came for one book and left with twelve tabs open."],
    responses: ["The cat has reached the chapter where time stops being real.", "Everyone is discussing the group chat instead of the book.", "One book, twelve tabs, and absolutely no new information."],
    captions: [{ top: "ONE MORE PAGE", bottom: "THE SUN IS COMING UP" }, { top: "STUDY GROUP CHAT", bottom: "NO STUDY DETECTED" }, { top: "CAME FOR ONE BOOK", bottom: "OPENED 12 SIDE QUESTS" }],
    prompt: "The library is my second home, and midnight is apparently my new afternoon.",
  },
  {
    id: "campus", name: "Campus", topic: "Campus", mark: "02", image: "/room/animals/campus-raccoon.webp", template: "animal-campus-raccoon", mood: "A tiny walk becomes a side quest.",
    situations: ["I left for class ten minutes ago and met three friends.", "The campus shortcut added a scenic twenty minutes.", "My backpack is carrying this semester emotionally."],
    responses: ["The raccoon has been stopped by every person it knows. Attendance is unclear.", "The shortcut has become the long way with better scenery.", "The backpack is doing all the emotional heavy lifting."],
    captions: [{ top: "ON MY WAY TO CLASS", bottom: "THREE FRIENDLY DETOURS LATER" }, { top: "TAKING THE SHORTCUT", bottom: "SCENIC ROUTE UNLOCKED" }, { top: "PACKED FOR ONE DAY", bottom: "CARRYING THE SEMESTER" }],
    prompt: "I left for one class and somehow got pulled into three campus side quests.",
  },
  {
    id: "subway", name: "Subway", topic: "EastVillage", mark: "03", image: "/room/animals/subway-dog.webp", template: "animal-nyc-dog", mood: "The ETA is a creative writing exercise.",
    situations: ["The train says two minutes for the fourth time.", "I missed my stop while guarding a dollar slice.", "The express train has become a local in spirit."],
    responses: ["The dog knows the train arrives when it feels emotionally ready.", "The slice made it safely. The stop did not.", "Express in the schedule, local in the heart."],
    captions: [{ top: "TRAIN ARRIVING IN 2 MIN", bottom: "A VERY FLEXIBLE 2 MIN" }, { top: "GUARDING THE PIZZA", bottom: "MISSED MY STOP AGAIN" }, { top: "EXPRESS TRAIN", bottom: "STOPPING FOR THE VIBES" }],
    prompt: "The subway ETA says two minutes. It has said two minutes for ten minutes.",
  },
  {
    id: "dorm", name: "Dorm", topic: "Campus", mark: "04", image: "/room/animals/dorm-cat.webp", template: "animal-dorm-cat", mood: "Small room, enormous laundry pile.",
    situations: ["My laundry pile has claimed a second bed.", "I went downstairs for water and came back with a new roommate story.", "The desk is now a very small bed."],
    responses: ["The cat has lost the bed to a hoodie with a busy schedule.", "The water trip has become a full season of roommate lore.", "Work-life balance achieved: sleeping at the desk."],
    captions: [{ top: "LAUNDRY DAY", bottom: "THE PILE GOT A BED FIRST" }, { top: "WENT FOR WATER", bottom: "RETURNED WITH LORE" }, { top: "DESK SETUP", bottom: "BEDROOM EXPANSION" }],
    prompt: "My dorm room is tiny, but the laundry pile has somehow claimed a second bed.",
  },
  {
    id: "dining", name: "Dining hall", topic: "Campus", mark: "05", image: "/room/animals/dining-cat.webp", template: "animal-dining-cat", mood: "One last plate, then one more.",
    situations: ["The dining hall is closing and I am still deciding.", "I came for a snack and built a four-course itinerary.", "The soft serve machine is the only group project I trust."],
    responses: ["The cat is weighing dessert options like a thesis defense.", "A snack has developed a beginning, middle, and dessert.", "Finally, a group project with dependable results."],
    captions: [{ top: "DINING HALL CLOSES SOON", bottom: "STILL REVIEWING OPTIONS" }, { top: "JUST A QUICK SNACK", bottom: "COURSE FOUR: SOMEHOW" }, { top: "GROUP PROJECT", bottom: "SOFT SERVE CAME THROUGH" }],
    prompt: "The dining hall is closing, but I’m still deciding if one more plate is a good idea.",
  },
] as const satisfies readonly {
  id: string; name: string; topic: Topic; mark: string; image: string; template: string;
  mood: string; situations: readonly string[]; responses: readonly string[];
  captions: readonly { top: string; bottom: string }[]; prompt: string;
}[];

export type RoomSceneId = (typeof ROOM_SCENES)[number]["id"];

export function roomScene(value: unknown) {
  return typeof value === "string" ? ROOM_SCENES.find((scene) => scene.id === value) ?? null : null;
}
