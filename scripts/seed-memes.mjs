// Publish real AI starter content through the running app's authenticated flow.
// No invented captions or votes. Completed prompts are skipped on repeat runs.
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { randomBytes } from "node:crypto";

const origin = new URL(process.env.SEED_BASE_URL || "http://localhost:3000");
if (origin.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(origin.hostname)) {
  throw new Error("Run the starter content script against your local app.");
}
for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"]) {
  if (!process.env[name]) throw new Error(`Missing ${name} in .env.local`);
}

const scenes = [
  { template: "This Is Fine", topic: "Campus", prompt: "I opened my syllabus after a weekend exploring NYC and discovered that all three midterms are tomorrow." },
  { template: "Surprised Pikachu", topic: "NYC", prompt: "I moved from the Midwest to NYC and thought a twelve dollar iced coffee must at least come with a chair." },
  { template: "Waiting Skeleton", topic: "Dorm life", prompt: "Waiting in the dorm laundry room for the person whose dryer has said one minute remaining since last semester." },
];
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
function checked(result, operation) {
  if (result.error) throw new Error(`${operation}: ${result.error.message}`);
  return result.data;
}

// A dedicated, disabled account keeps starter content out of members' quotas.
let author;
for (let page = 1; ; page++) {
  const { users } = checked(await admin.auth.admin.listUsers({ page, perPage: 100 }), "Find starter author");
  author = users.find((user) => user.app_metadata?.humor_starter_author === true);
  if (author || users.length < 100) break;
}
const password = randomBytes(48).toString("base64url");
if (!author) {
  const { user } = checked(await admin.auth.admin.createUser({
    email: "starter-memes@humor-project.example.invalid", password, email_confirm: true, ban_duration: "876000h",
    app_metadata: { humor_starter_author: true },
  }), "Create starter author");
  author = user;
}
const history = checked(await admin.from("generation_requests").select("prompt,status")
  .eq("user_id", author.id), "Read starter history");
const missing = scenes.filter((scene) => !history.some((item) => item.prompt === scene.prompt && item.status === "completed"));
if (!missing.length) {
  checked(await admin.auth.admin.updateUserById(author.id, { ban_duration: "876000h" }), "Disable starter author");
  console.log("All three starter memes are already published.");
  process.exit(0);
}

let browser;
let auth;
try {
  checked(await admin.auth.admin.updateUserById(author.id, { password, ban_duration: "none" }), "Prepare starter author");
  const cookies = [];
  auth = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [], setAll: (items) => cookies.push(...items) },
  });
  checked(await auth.auth.signInWithPassword({ email: author.email, password }), "Sign in starter author");
  browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies(cookies.map(({ name, value }) => ({ name, value, url: origin.origin, sameSite: "Lax" })));
  const page = await context.newPage();
  for (const scene of missing) {
    await page.goto(new URL("/create", origin).href);
    await page.getByRole("button", { name: `Use ${scene.template}`, exact: true }).click();
    await page.getByLabel("Pick your territory").selectOption(scene.topic);
    await page.getByLabel("Give it some context").fill(scene.prompt);
    await page.getByRole("button", { name: "Generate & publish meme" }).click();
    try {
      await page.getByRole("link", { name: "See your meme & share it" }).waitFor({ timeout: 45_000 });
    } catch {
      const message = await page.getByRole("status").allTextContents();
      throw new Error(`Starter generation did not finish: ${message.join(" ")}`);
    }
    const href = await page.getByRole("link", { name: "See your meme & share it" }).getAttribute("href");
    console.log(`Published ${scene.topic} starter: ${new URL(href, origin).href}`);
  }
} finally {
  try {
    await browser?.close();
    if (auth) checked(await auth.auth.signOut(), "Revoke starter session");
  } finally {
    checked(await admin.auth.admin.updateUserById(author.id, { ban_duration: "876000h" }), "Disable starter author");
  }
}
