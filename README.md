# The Humor Project

An image-meme feed for Columbia students. Signed-in members choose a classic reaction template or upload a photo and
describe a scene. GPT-6 Luna looks at the photo, writes short top/bottom captions,
and the community votes on the resulting meme.
Google sign-in, onboarding, profiles, and avatar uploads remain available.

## Product choices

- **Daily inspiration:** a rotating prompt changes at midnight in New York,
  giving Sam a quick reason to return and an easy starting point.
- **Images first:** browse eight locally hosted reaction templates, search by name
  or mood, and filter categories. Or upload a JPEG, PNG, or WebP (up to 3 MB).
  Preview the image, then add context. The AI sees the actual image. Sign-in is required
  to browse templates, create memes, or read the feed.
- **Local, specific humor:** Campus, NYC, and Dorm life topics connect the jokes
  to a student exploring New York on weekends.
- **Newest / Top this week:** fresh submissions get visibility; weekly scores
  help good content surface without old winners dominating forever.
- **Shareable joke pages:** every generated meme has a member URL and copy-link
  button for group chats. Opening shared links, creation, and voting all require sign-in.
- **One changeable vote:** Funny (+1) or Not quite (-1), with persisted feedback.
  Repeated clicks cannot inflate scores.
- **Private prompt history:** members can see their last ten generation attempts,
  and links to the results. Prompts are not published in the feed.

These choices improve on a generic caption generator by pairing local context
with a photo-to-meme creation flow, visible community feedback, and easy sharing. The
app deliberately avoids unrelated chat, friend, or notification features.

## Environment

Use Node 22.13+ or Node 24. Store local values in `.env.local` (ignored by Git):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
OPENAI_API_KEY=your-server-only-openai-key
# Optional; the default is the requested Luna model:
OPENAI_MODEL=gpt-6-luna
```

Add these variables in Vercel's Production environment as well. Never prefix
server keys with `NEXT_PUBLIC_`. OpenAI needs a funded API account with access to
GPT-6 Luna. The app uses Responses API image input with `detail: low`, structured output,
no reasoning tokens, a 400-token output cap, a 30-second timeout, and `store: false`.

## Supabase

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Migrations preserve existing jokes and profiles and create:

| Table | Read | Write |
| --- | --- | --- |
| `jokes` | Public legacy collection for older deployments | No client writes |
| `profiles` | Owner only | Owner can update profile fields only |
| `generation_requests` | Owner only, including prompts | Server only |
| `captions` | Signed-in captions, image reference, and image alt text | Server only |
| `meme-images` Storage bucket | Owner before publication; signed-in readers after publication | Server only |
| `caption_votes` | Owner only | Authenticated owner inserts; updates only `value` |

RLS is enabled for all application tables. Supabase's managed Auth/Storage
schemas retain their platform policies; existing avatar writes are owner scoped.
The migration also enables RLS on any other existing `public` tables.

Every generation and vote action checks `auth.getUser()` independently. Votes
use the signed-in Supabase client, so RLS applies even if the action is bypassed.
A primary key on `(caption_id, user_id)`, a foreign key to the actual caption,
and a check constraint for `-1`/`1` enforce vote integrity. The first vote is an
INSERT; changing it updates that row.

Signed-out visitors see only a login screen. The feed, studio, and meme pages
check authentication before loading content; meme metadata is hidden from guests.
Anonymous caption reads and feed RPC execution are revoked. The legacy `jokes`
table retains anonymous read access for older deployments, with RLS enabled and
no client writes. Meme images are
served through an authenticated route with private, non-caching responses.

Only server credentials can reserve or publish a generation. The reservation
function uses a per-user transaction lock to enforce five attempts in a rolling
24 hours, including failures. Publication atomically inserts the caption, photo reference, and image description
and marks the request completed. `complete_meme_generation` requires an existing
stored image belonging to that exact user and generation request. The exact system instruction, user scene, topic,
and model are saved before the provider request; the user message sent to OpenAI
is `Topic: {topic}\nScene: {prompt}`, accompanied by the normalized photo. Missing keys and provider failures produce
recoverable UI messages instead of publishing placeholder results.

`caption_feed` intentionally uses a fixed, read-only SECURITY DEFINER function
to return member captions and aggregate scores without exposing voter IDs. It
has an empty search path, no dynamic SQL, bounded pagination, and an explicit
return shape. Its execution is restricted to authenticated clients; anonymous execution is revoked. Generation RPCs
are explicitly unavailable to anonymous and authenticated clients.

## Image storage and rendering

The server resolves template IDs against a fixed catalog and reads local assets;
it never fetches a user-supplied image URL or reads a user-supplied path. The
private request stores the selected `template_id` (null for uploads). Template
sources are documented in `public/meme-templates/README.md`; images are included
in the `/create` server trace for Vercel. Both sources use the same pipeline.

The server decodes images with Sharp, verifies the format matches the MIME type,
rejects corrupt/animated/oversized images, caps decoded inputs at 25 megapixels,
auto-orients, resizes to at most 1200×1200, and strips EXIF/location metadata.
Invalid uploads are rejected before reserving a generation attempt. Normalized
JPEGs live in the private `meme-images` bucket, named by user and request UUID.

RLS permits signed-in image reads only when a published caption references that
object. The feed uses session-checked image routes; unpublished images are readable
only by their owner and the server. Failed generation uploads are removed after the
request is confirmed failed. No client can overwrite or delete meme images.

Photo bytes are stored in Supabase Storage and their path, both AI caption lines,
and AI-written alt text in Postgres. The browser renders the caption over the
photo in a classic meme layout; older text-only jokes and their votes still work.
Sharing copies the member meme page URL; recipients must sign in. The full caption is accessible as text,
and the underlying photo has descriptive alt text.

## Google sign-in

In Google Auth Platform, use a Web application OAuth client. Allow the production
site origin and `http://localhost:3000`; Google's redirect URI is the Supabase
Auth callback (`https://YOUR_PROJECT.supabase.co/auth/v1/callback`). Configure
this client under Supabase Authentication → Providers → Google.

In Supabase Authentication → URL Configuration, set the Site URL to
`https://humanproject-hazel.vercel.app` and allow:

- `http://localhost:3000/auth/callback`
- `https://humanproject-hazel.vercel.app/auth/callback`
- `https://*-rc3502-1440.vercel.app/auth/callback`

OAuth always uses `/auth/callback` without extra query parameters. A short-lived
HTTP-only cookie preserves an allowlisted create/joke destination during login.

## Development and verification

For local use, start `npm run dev` and open `http://localhost:3000`. In another
terminal, run `npm run seed:memes` once to publish three genuine AI-generated
starter memes for the Campus, NYC, and Dorm life topics. This uses the database
configured in `.env.local` and makes up to three real provider requests through
the local app. It saves the images, captions, and exact generation prompts using
the same authenticated publication flow as members. It skips already completed
starter prompts and uses a dedicated account that is disabled afterward. No
votes are seeded. Sign in with Google to vote or publish your own meme.

`SEED_BASE_URL` can specify a different local port. Install Playwright Chromium
with `npx playwright install chromium` if it is not already available.
No deployment is needed for this local workflow.

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
npx supabase db query --linked --file supabase/tests/ai_permissions.sql
npx supabase db query --linked --file supabase/tests/image_permissions.sql
npx playwright install chromium
npm run test:e2e
```

The SQL test checks guest denial, ownership isolation, forged and duplicate
votes, public aggregate correctness, forbidden direct publication, the generation
limit, atomic persistence, and RLS. Its test data is inside a rolled-back transaction.

The browser test uses the configured Supabase database, makes two real short
OpenAI calls, and creates a temporary Auth user. It verifies guest access denial,
template search/filter/selection, photo upload, invalid-file and forged-template
rejection before quota, private image access, AI vision captions,
private history, vote changes and reload persistence, mobile layout,
weekly ordering, and logout. A `finally` block deletes the temporary user and all
associated data and uploaded test images. Set `TEST_BASE_URL` to test an already deployed site; otherwise
build first, and Playwright starts the production server on port 3100.

## Deployment

```bash
git add .
git commit -m "Add AI joke generation, voting, and database security"
git push origin main
```

Keep Vercel Deployment Protection disabled for public and incognito access.
GitHub pushes automatically trigger Vercel production builds. Do not also run
a manual deploy for the same commit. Wait for the deployment matching the new
Git SHA to be Ready, then submit that unique deployment URL rather than the
moving production alias.

## PM feedback

During the feedback session, ask the PM to generate a joke, vote, change the vote,
and share it with another signed-in member without explanation. Record where they hesitate, whether today's
prompt feels relevant, and whether the weekly feed makes them want to return.
Implemented feedback so far: replace the text-first joke flow with photo uploads
and image-based memes, then a searchable reaction-image template gallery and
a responsive reaction-template flow, followed by a distinct monochrome and sage
visual design inspired by Cosmos and Orbit Core. The studio places a masonry
image board beside the editor on desktop and stacks it on phones. Geist is
self-hosted with its OFL license in `src/app/fonts/`, so browsing does not depend
on a third-party font service. Further PM-session feedback can be
recorded and implemented after that session.
