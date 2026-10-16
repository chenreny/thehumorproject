# UI redesign brief: Campus After Hours

Date: October 11, 2026
Project: The Humor Project
Status: Design and implementation instructions; application changes have not started.

## 1. Purpose and approved direction

Redesign The Humor Project as a playful, independent late-night campus channel. The website should feel like a small cultural space built by students: expressive, slightly irreverent, and easy to use. Memes are the main attraction. The visual environment makes them feel part of a shared community.

The user liked the atmosphere and immersion of a campus-map reference and Krillion, but explicitly rejected using a map because another student's project already uses that idea. Build a distinctive broadcast identity instead.

Keep **The Humor Project** as the product name. Use **Campus After Hours** as a creative direction and optional descriptive line, rather than silently renaming the product.

This document describes future work. Writing this brief does not authorize implementation, deployment, database changes, or provider calls in the current task.

### Desired first impression

Within five seconds, a signed-in visitor should understand:

1. This is a campus meme community.
2. There is something funny to look at immediately.
3. They can vote, browse more memes, or create their own.

A returning visitor should encounter content immediately instead of repeatedly scrolling past a marketing introduction.

### Design priorities, in order

1. Readable meme images and captions.
2. Obvious browsing, voting, and creation actions.
3. A memorable, consistent visual identity.
4. A comfortable experience on phones.
5. Small expressive interactions that reinforce the channel concept.

When decoration conflicts with these priorities, simplify the decoration.

## 2. What to borrow from the references

Krillion reference: <https://krillion.io/>.

Borrow the coherence of its setting and interaction language: a strong visual environment, a focused main action, and small details that support one concept. Its ocean setting and dive language illustrate how a theme can explain an experience. Develop original artwork, colors, typography, and interactions for this project.

From the campus-map screenshots, borrow the feeling that the interface belongs to a shared student world. Translate that feeling into a channel that collects campus experiences.

### Excluded directions

- Campus maps, geographic pins, location selection, or explorable buildings.
- A copy of Krillion's ocean, boat, logo treatment, or dive progression.
- A full television illustration that shrinks the meme into a tiny screen.
- Persistent scanlines, image distortion, static flashes, or flickering text.
- A computer desktop with draggable windows; that was an alternative concept, not the selected direction.
- A general social network expansion with chat, friends, notifications, or live presence.
- Decorative controls that look actionable but do nothing.

## 3. Current application and implementation constraints

The current application is a Next.js App Router project with React, Tailwind, Supabase authentication and storage, and server actions for generation and voting.

Relevant existing files:

| File | Current responsibility |
| --- | --- |
| `src/app/globals.css` | Global tokens, shared controls, typography, meme captions |
| `src/app/layout.tsx` | Self-hosted Geist font and global metadata |
| `src/components/site-nav.tsx` | Shared navigation and sign-out action |
| `src/components/sign-in-screen.tsx` | Guest home and Google sign-in |
| `src/app/page.tsx` | Authenticated feed, introduction, daily prompt, sorting, pagination |
| `src/components/caption-card.tsx` | Meme display, votes, score, sharing |
| `src/components/meme-image.tsx` | Image with top and bottom meme captions |
| `src/app/create/page.tsx` | Studio shell and private generation history |
| `src/app/create/generation-form.tsx` | Templates, uploads, generated images, context, submission |
| `src/app/create/actions.ts` | Server generation and immediate publication |
| `src/app/captions/[id]/page.tsx` | Individual meme page |
| `src/app/profile/page.tsx` | Profile and avatar editing |
| `src/app/profile/profile-form.tsx` | Profile fields and save feedback |
| `src/app/welcome/page.tsx` | Profile onboarding |
| `src/app/members/page.tsx` | Member welcome screen |
| `src/lib/captions.ts` | Feed RPC and saved vote reads |
| `src/lib/generation.ts` | Topics, prompt validation, daily inspiration |
| `src/lib/templates.ts` | Existing local template catalog |

### Framework requirement

Before writing application code, follow `AGENTS.md` and read the relevant installed Next.js guides in `node_modules/next/dist/docs/`. This repository explicitly warns that its installed framework version may differ from familiar conventions. Use installed documentation for routing, server/client boundaries, images, fonts, caching, and server actions as needed.

### Product behavior to account for

- Member feed, meme pages, creation, and meme image routes require authentication.
- Existing topics are exactly `Campus`, `NYC`, and `Dorm life`.
- Votes are +1 or -1, with one changeable vote per member per meme.
- Feed order options are Newest and Top this week.
- The current weekly feed uses a rolling seven-day eligibility window. Preserve its existing semantics unless separately changing the product requirement.
- Feed requests currently return at most 30 records, with offset pagination.
- The current feed API does not provide a topic filter.
- Generation accepts templates, uploads, and AI-generated images.
- Successful generation currently publishes immediately.
- Context is required and must contain 10–500 characters.
- Meme uploads accept still JPEG, PNG, and WebP images up to 3 MB.
- Avatar uploads have their own 2 MB limit.
- The latest generation limit is 10 attempts per rolling 24 hours, including unsuccessful attempts. Some historical documentation still says five; use current server behavior as the source of truth.
- Generation history is private to its owner.
- The current feed data does not include a public creator identity or live viewer count.

Keep authentication, image access protections, upload validation, vote constraints, prompt privacy, and quota enforcement intact throughout the redesign.

## 4. Creative concept

### Working description

**An unofficial late-night campus channel where student life becomes memes.**

The broadcast concept should appear through composition and small details:

- A compact station-style masthead.
- A prominent image stage.
- Clearly labeled topic channels.
- A thumbnail strip for other available memes.
- A daily prompt presented as a brief programming note.
- Small channel numbers and technical-looking labels.
- A creation studio that feels related to the browsing screen.

The page is still a website with ordinary navigation, scroll behavior, and forms. People should not need to understand a game metaphor to complete an action.

### Tone

Use casual, concise copy with restrained campus humor. Put personality into headlines and optional supporting lines. Keep form labels, errors, limits, and action labels literal.

Examples:

| Context | Suggested copy |
| --- | --- |
| Home descriptor | Campus after hours. |
| Home supporting line | Campus chaos. City detours. Dorm drama. |
| Primary action | Make a meme |
| Topic filter label | Channels |
| Daily inspiration | Today's prompt |
| Studio heading | Your moment. Your punchline. |
| Context field | What's the situation? |
| Vote helper | One vote per meme. Change your mind anytime. |
| Share success | Link copied. |
| Generation success | Your meme is published. |

Avoid making every action a broadcast pun. In particular, keep Sign in, Profile, Upload a photo, Generate an image, Save, and Share easy to recognize.

## 5. Visual system

### 5.1 Color palette

Use these as starting tokens, then check contrast in their actual pairings:

| Token | Initial value | Use |
| --- | --- | --- |
| `--background` | `#10182B` | Main midnight-blue page |
| `--surface` | `#18243B` | Dark cards and support panels |
| `--surface-raised` | `#22304A` | Selected controls and elevated dark regions |
| `--foreground` | `#F4EEDF` | Main text on dark backgrounds |
| `--muted` | `#A7B3C8` | Secondary text on dark backgrounds |
| `--paper` | `#F4EEDF` | Cream editorial panels |
| `--ink` | `#10182B` | Text on cream and coral backgrounds |
| `--paper-muted` | `#42506B` | Secondary text on cream panels |
| `--accent` | `#FF785E` | Primary action and selected emphasis |
| `--signal` | `#C6F56A` | Small identity details and success accents |
| `--border` | `#35445E` | Visible dividers on dark surfaces |

Rules:

- Midnight blue and cream should dominate the composition.
- Use coral for one or two important actions per region, rather than every badge.
- Use dark text on coral buttons; do not assume white text has adequate contrast.
- Keep signal green sparse. Pair status color with readable text or an icon.
- Maintain separate text colors for dark surfaces and cream surfaces.
- Do not tint meme photos to fit the palette.
- Avoid gradients as the primary visual identity. A very subtle ambient gradient is optional.
- Treat these tokens as a coordinated system; do not mechanically replace the old accent color everywhere.

### 5.2 Typography

Use a maximum of three roles:

1. **Display:** a bold condensed sans serif for the masthead and short large headings.
2. **UI/body:** existing self-hosted Geist for navigation, forms, descriptions, and readable content.
3. **Technical labels:** the existing monospace stack for compact channel numbers and small decorative labels.

For an initial implementation, Geist at a heavy weight is an acceptable display fallback. If adding a condensed font, use a licensed, self-hosted font and retain its license. Do not make the design depend on a third-party font request.

Suggested scale:

| Role | Desktop | Mobile |
| --- | --- | --- |
| Home display heading | 56–80 px | 32–44 px |
| Page heading | 36–48 px | 28–36 px |
| Section heading | 22–28 px | 20–24 px |
| Body | 16 px | 16 px |
| UI labels | 14–16 px | 14–16 px |
| Secondary metadata | 12–14 px | 12–14 px |

Display headings can use tight line height around 0.95–1.05. Body copy should use 1.45–1.65. Avoid extended uppercase paragraphs or excessive letter spacing.

Keep classic Impact-style meme captions where they are part of the generated meme. Scale captions to the meme container, especially when the same image appears at multiple sizes. A viewport-only caption scale is insufficient for small thumbnails beside a large stage.

### 5.3 Spacing and shape

- Base spacing units: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Desktop page width: approximately 1280–1360 px.
- Desktop outer gutters: 32–48 px; tablet: 24 px; mobile: 16 px.
- Main layout gap: 24–32 px on desktop; 16–24 px on phones.
- Major panel radius: 12–16 px.
- Button and field radius: 8–10 px.
- Chips and small badges may use a pill shape where appropriate.
- Use fine borders and occasional small offset shadows for cream panels.
- Avoid putting a rounded white card around every piece of content.
- Build hierarchy through image size, typography, contrast, and alignment.

### 5.4 Decorative language

Suitable details include a small signal mark, thin tick marks, a simple abstract waveform, channel numbers, and restrained corner brackets.

Use decorative motifs in the masthead or panel borders. Keep the image area clean. Build simple motifs with SVG or CSS when appropriate, and mark purely decorative elements as hidden from assistive technology.

No background video, autoplay audio, particle field, rotating 3D scene, or required WebGL is needed for this concept.

## 6. Shared navigation

Replace the current centered navigation pill with a clearer station-style bar.

### Desktop

- Left: The Humor Project wordmark with a small original signal symbol.
- Center or immediately after the wordmark: Browse and Create.
- Right: Profile, Sign out, and the primary Make a meme action.
- Use a thin lower divider and a modest background that keeps text readable while scrolling.
- Target height: 72–80 px, without excessive empty space.
- Show the active destination through text weight plus an underline or small marker.

The Create navigation link and Make a meme button may both link to the studio, but they must have distinct hierarchy. On constrained widths, retain one visible studio entry point rather than crowding the bar with duplicate actions.

### Mobile

- Keep the wordmark compact.
- Keep Browse, Create, and Profile discoverable.
- If using a menu, provide an accessible button, close behavior, Escape support, and managed focus.
- Keep the primary creation action visible on the browsing page without making the header too tall.
- Prefer a normal-flow full-width action near the channel controls. A sticky action is optional only if it does not cover content or the keyboard.
- Respect device safe areas for fixed elements.

## 7. Signed-in home page: `/`

### 7.1 Desktop composition

The first screen should have a strong horizontal composition with one clear image focal point. Suggested arrangement:

```text
THE HUMOR PROJECT          Browse  Create          Profile  Make a meme
------------------------------------------------------------------------
CAMPUS AFTER HOURS.                 Campus chaos. City detours. Dorm drama.
------------------------------------------------------------------------
Channels: All / Campus / NYC / Dorm life          Newest / Top this week

+-------------------------------------------+  +------------------------+
|                                           |  | SELECTED MEME          |
|              FEATURED MEME                |  | Topic / score / votes  |
|         Full image and captions           |  | Vote and share         |
|                                           |  |                        |
|                                           |  | TODAY'S PROMPT         |
+-------------------------------------------+  | Prompt + creation link |
                                                +------------------------+
MORE IN THIS CHANNEL:    [thumbnail] [thumbnail] [thumbnail] [thumbnail]
------------------------------------------------------------------------
More memes              [image cards in a responsive grid]
```

This is a layout schematic, not a requirement to draw literal boxes around every region.

At wide desktop sizes, use approximately two thirds of the feature area for the meme and one third for supporting information. Keep the support column around 300–360 px when space allows. Give the image stage a bounded height of roughly 480–600 px on comfortable desktop viewports; adapt for shorter screens.

### 7.2 Masthead

- Use one large, left-aligned heading rather than the current centered two-line marketing hero.
- Suggested heading: Campus after hours.
- Keep supporting copy short enough to fit one or two lines.
- Avoid a large introductory section that pushes the first meme below the fold.
- Use a thin rule or small technical detail to connect the masthead to the stage.
- Do not label the site LIVE or show a viewer counter unless actual live functionality exists.

### 7.3 Main meme stage

- On page load, select the first meme returned by the active topic, sort, and page.
- Label it Featured meme or Now showing. Here, Featured means the selected item, not an editorial award or a separately curated ranking.
- Preserve the image's meaningful content. Use containment for full meme viewing.
- Do not crop the top or bottom caption to fit an arbitrary widescreen box.
- Letterbox with a neutral dark surface when necessary.
- Keep score, total votes, voting controls, sharing, and an Open meme link close to the stage.
- Do not overlay navigation, labels, or visual effects on top of meme captions.
- Support text-only legacy entries with a deliberate typographic treatment instead of a broken image box.

### 7.4 Thumbnail strip

- Show up to four or five other records from the currently loaded page.
- Selecting a thumbnail updates the stage without navigating away.
- Use a visible active state and a descriptive button label based on the meme's setup.
- Keep thumbnails large enough to recognize the image, approximately 112–144 px wide on desktop.
- Thumbnails may show image previews without tiny caption overlays; expose the full setup in an accessible label or adjacent short title.
- Do not attach vote controls to thumbnail previews.
- Use manual selection only. No automatic slideshow or timed rotation.
- Only render a strip when there is another actual meme to select.
- This strip is a selection of loaded content, not a claim that all memes have been prefetched.

### 7.5 Daily prompt

Place the existing daily inspiration in the support column or a short editorial band. Use the existing `dailyScene()` behavior and New York date semantics.

- Label it Today's prompt.
- Show the real prompt without rewriting it into misleading personalized copy.
- Action: Make a meme from this prompt.
- Preserve `/create?daily=1` as the existing entry point.
- Use a small decorative marker instead of an invented global episode number.
- On mobile, move the prompt below the main meme and reaction controls.

### 7.6 Collection below the stage

- Keep a normal scrolling grid for efficient browsing.
- Target three columns on wide screens, two on tablets, and one on narrow phones.
- Start with a consistent grid. The large feature stage already supplies asymmetry.
- Any larger card variants must preserve DOM reading order, keyboard order, and complete captions.
- Exclude the currently selected stage item from the lower grid to avoid duplicate reaction controls for it.
- When selection changes, update that exclusion using stable IDs.
- Other loaded records can appear both as a thumbnail preview and as a full lower-grid card.
- Keep all visible score and vote states for a given ID consistent after mutation.
- Keep pagination readable and accessible.

### 7.7 Sparse content

- Zero records: show an intentional empty stage with a short invitation and Make a meme action.
- One record: show it in the stage; omit the thumbnail strip and empty collection shell.
- Two to five records: show only available thumbnails and cards.
- Avoid fake community memes, scores, creator names, or padded duplicates.
- Existing starter templates can remain a clearly labeled, authenticated creation suggestion when the feed is empty. They must not appear to be published community memes.
- A failed feed request gets an error and retry affordance, not an empty-community message.
- A later empty page should say the visitor has reached the end and offer a previous-page link.

## 8. Channels, sort order, and URLs

Channel choices:

| UI label | URL value | Stored topic |
| --- | --- | --- |
| All | `all` or omitted | No topic restriction |
| Campus | `campus` | `Campus` |
| NYC | `nyc` | `NYC` |
| Dorm life | `dorm` | `Dorm life` |

All is the default so a small community does not immediately split into empty views.

Suggested canonical URL shape: `/?topic=campus&sort=week&page=0`.

Rules:

- Validate query values on the server; unsupported topic values fall back to All.
- Keep current sort values `new` and `week` unless a deliberate migration is needed.
- Changing topic or sort resets pagination to the first page.
- Pagination preserves both topic and sort.
- Browser back and forward restore the selected channel and sort.
- Selecting a thumbnail is local state; changing channel, sort, or page resets stage selection to the first returned record.
- Represent route navigation as links with a clear current state. Do not misuse tab semantics for ordinary links.

### Required data work

The current `getFeed()` and `caption_feed` RPC do not support topic filtering. Channel filtering is therefore a small functional addition, not only a CSS change.

Filter by topic **before** sorting, limiting, and offsetting in the authoritative feed query. Filtering the current 30 results in the browser would miss content on later pages and produce incorrect empty states.

When implementation is authorized:

1. Inspect the latest migrations that define the feed RPC and its image fields.
2. Add a bounded, allowlisted topic parameter or a separate compatible member-only feed function.
3. Preserve existing aggregate score and saved-vote behavior.
4. Preserve authenticated-only execution and existing image protections.
5. Preserve any individual-ID lookup behavior used by meme pages.
6. Keep a deterministic secondary ordering for equal scores or timestamps.
7. Update the server wrapper and home-page parsing together.
8. Check for function overload and default-argument ambiguity if extending the existing SQL signature.
9. Avoid querying all captions into the client to implement filtering.

Do not silently display working-looking channel controls backed by incomplete filtering. During a purely visual interim stage, omit those controls until the query behavior is connected.

## 9. Meme cards, votes, and sharing

### Card anatomy

1. Short metadata row: topic and, when useful, a real date.
2. Complete meme image or legacy text meme.
3. Compact score and vote count.
4. Icon reaction controls and Share.

The feature-stage variant can enlarge the image and arrange metadata alongside it. Lower-grid and detail variants should share behavior and accessible labeling.

### Voting

- Preserve +1 and -1 semantics and the ability to change a vote.
- Label controls clearly; an emoji may supplement text or an accessible label.
- Distinguish the saved reaction using shape, text/icon, and color.
- Show pending feedback on the affected meme only.
- Reconcile state with the server result and revalidation.
- If an optimistic update is used, restore the previous state on failure.
- Show a readable inline failure message and keep the controls reachable.
- If saved votes fail to load, do not imply that the visitor has no saved votes. Resolve that state before presenting reliable selection feedback.
- Do not introduce a third reaction or an undo behavior unless server semantics are intentionally extended.
- Do not announce every score on the page after one mutation; announce only meaningful local feedback.

### Sharing

- Preserve individual member meme URLs.
- Use a clear Share control that copies the link.
- Show Link copied after success and a practical fallback after clipboard failure.
- Include a concise explanation that recipients need to sign in where it helps the sharing decision.
- Do not add public image URLs or public member-content previews as a styling shortcut.

## 10. Creation studio: `/create`

The studio should feel related to the channel homepage through colors, typography, rules, and compact labels. Keep actual creation tasks obvious.

### 10.1 Desktop layout

At approximately 1280 px and above, use a production-desk composition:

- Left, about 30%: image-source controls and template browser/upload/generated-image input.
- Center, about 40%: prominent selected-image or result preview.
- Right, about 30%: topic, context, prompt helper, submit action, status.

Use flexible tracks rather than rigid widths that overflow. At intermediate widths, use two columns with the preview and context together. On phones, use one column.

Keep the preview visually larger than the controls. Reduce the current large introductory header so the working area appears sooner.

### 10.2 Image source controls

Keep exactly the three existing modes:

- Templates.
- Upload a photo.
- Generate an image.

Use a clear segmented control with a strong selected state. Do not add unsupported stock search or camera capture controls.

### 10.3 Templates

- Preserve all eight existing local templates.
- Preserve search by the existing searchable fields and category filtering.
- Keep the selected tile obvious with a border and check indicator.
- Show names in readable text.
- Preserve local source attribution where applicable.
- Remove `mix-blend-multiply` styling that changes the original image colors.
- Avoid aggressive crops that remove expressive faces or both sides of a split template.
- Thumbnails may use carefully chosen crops; the main selected preview must show the complete image.
- A no-results state includes Clear filters.
- Template choice should not clear entered context unnecessarily.
- On phones, bring the preview/editor into view only when useful and respect reduced motion.

### 10.4 Uploads

- Provide an obvious labeled file picker and a selected-image preview.
- Show actual accepted formats and the 3 MB limit near the input.
- Include a Replace photo action after selection.
- Display file errors beside the picker.
- Preserve file input submission and existing normalization rules.
- Keep object URL cleanup when replacing images or unmounting.
- Add drag and drop only if fully implemented with the same validation; do not imply support through decorative copy alone.

### 10.5 Generated images

- Explain that this mode creates an original image and its meme caption.
- Keep the scene/context input easy to find.
- Before submission, show an honest empty preview with guidance.
- Do not show an unrelated template as though it were the generated output.
- On success, show the real returned meme with its generated captions.

### 10.6 Context and topic

- Label the topic choice Topic or Channel.
- Use exactly the existing topic values expected by validation.
- Label the textarea What's the situation? for provided images.
- Use Describe the image and situation for generated-image mode.
- Keep the 10–500 character requirement and counter visible.
- Keep Use today's prompt as a secondary action.
- Show required-field guidance before submission and errors near the field.
- Preserve the chosen source, topic, and context after recoverable errors when possible.
- Changing image source may clear source-specific selections, but should retain the user's topic and context.

### 10.7 Publication behavior in the first redesign

For the initial redesign, preserve the current server action: successful generation immediately publishes a meme.

- Button label: Generate & publish meme.
- Helper: Your meme will appear in the member feed after generation.
- Pending copy must accurately describe the operation.
- Success copy: Your meme is published.
- Success actions: Open meme and Share.
- Present the successful output in every mode, not only generated-image mode.
- Show the actual quota rule: 10 attempts per rolling 24 hours, including unsuccessful attempts.
- Do not display a numeric remaining balance unless derived from authoritative data.
- Do not show a fake percentage or invented generation stage sequence.
- Keep provider failures recoverable and explain the existing attempt-count behavior.

### 10.8 Optional later enhancement: preview before publication

A generate → private preview → explicit publish flow is a recommended future product enhancement. It requires changes to persistence, permissions, generation actions, and publication lifecycle.

It is not safe to change the visible button to Generate or add a Publish button while the server still publishes automatically.

If implementing this enhancement later, first design private draft storage, owner-only preview access, explicit authenticated publication, duplicate-publication handling, abandoned-draft cleanup, and quota semantics. Keep it outside the first visual redesign unless separately requested.

### 10.9 Generation history

- Keep the last ten attempts and their privacy behavior.
- Move history below the primary working area.
- Use compact rows or cards with date, readable status, prompt, and Open meme when available.
- Translate raw status values into helpful labels such as Pending, Completed, and Failed.
- Long prompts wrap naturally.
- Do not publish private prompts in the home feed or shared meme pages.

## 11. Guest home and authentication

Replace the isolated white sign-in card with an introduction that shares the broadcast identity.

### Desktop composition

- Left: original wordmark, large Campus after hours heading, and one short product explanation.
- Right or below: a stylized abstract channel panel built from original graphics and typography.
- Clearly visible Continue with Google action.
- Short member-access explanation.
- Same midnight-blue, cream, and coral system as the authenticated experience.

Suggested explanation: Turn campus moments into memes. Let the community judge the punchline.

The decorative panel may contain fictional editorial headings such as Dorm drama or Deadline season, clearly presented as illustration. Do not fetch or expose member memes, private prompts, vote data, or member avatars for a guest preview.

### Behavior

- Preserve the intended destination through the existing allowed auth redirect flow.
- Preserve Google sign-in and callback behavior.
- Show authentication failures near the action with a readable retry instruction.
- Keep the sign-in action above the fold on phones.
- Avoid forced intro animations, background sound, or an extra click before sign-in.

## 12. Individual meme page: `/captions/[id]`

- Use the shared masthead and theme.
- Make the complete meme the primary focus at a comfortable width of approximately 680–840 px on large screens.
- Include topic, score, votes, reaction controls, Share, and a clear Back to browse link.
- Provide Make your own as a secondary action.
- Use the existing member access checks and metadata behavior.
- Support not-found, load failure, and image failure states deliberately.
- Keep an accessible textual representation of both caption lines.
- Do not add a public author byline; current feed data does not expose public creator identity.
- Sharing this page must preserve its authentication requirement.

## 13. Profile, onboarding, and member welcome

Carry the design system through supporting pages so the redesign feels complete.

### Profile

- Use a restrained two-section layout: names and avatar.
- Keep text inputs and upload controls highly readable.
- Show save feedback close to the relevant form.
- Preserve existing field validation and avatar behavior.
- Keep the truthful note that the profile photo is publicly viewable.
- Use the avatar-specific 2 MB limit rather than the meme upload limit.
- Avoid a decorative creator dashboard that implies unsupported analytics.

### Onboarding

- Use a focused cream panel against the dark environment.
- Preserve the existing first-name and last-name requirements.
- Keep the heading welcoming and the action clear.
- Preserve the existing onboarding redirects and completion checks.

### Member welcome

- Apply the same typography and surfaces to the existing welcome page.
- Keep Browse memes and Make a meme as obvious next actions.
- Avoid expanding this page into an additional mandatory tutorial.

## 14. Responsive behavior

Treat these as layout bands, adapting where actual content requires it:

| Width | Layout |
| --- | --- |
| Under 640 px | Single-column browsing and studio |
| 640–1023 px | Compact feature region, two-column meme grid, stacked studio or suitable two-column layout |
| 1024–1279 px | Feature stage with support column where comfortable; two-column studio |
| 1280 px and above | Full desktop composition; three-column studio |

### Mobile home order

1. Compact navigation.
2. Short masthead.
3. Topic channels and sort controls.
4. Featured meme.
5. Vote controls, score, Share, Open meme.
6. Optional thumbnail strip.
7. Daily prompt.
8. Remaining meme cards and pagination.

Keep the primary Make a meme action reachable near the top without requiring a floating overlay.

### Mobile studio order

1. Page heading and source controls.
2. Image source selection.
3. Selected-image preview.
4. Topic and context.
5. Submit, quota information, and result feedback.
6. Private history.

### Responsive requirements

- No whole-page horizontal overflow at 320 px width.
- Topic controls wrap or use a clearly bounded horizontal strip.
- A horizontal thumbnail strip must not turn vertical page scrolling into a gesture trap.
- Avoid nested scrolling editors on mobile.
- Do not depend on hover for essential actions.
- Touch targets should normally be at least 44 × 44 px.
- Long captions, filenames, prompts, and user names wrap without breaking layout.
- Sticky regions must not obscure fields, errors, or controls when the software keyboard is open.
- Use dynamic viewport units appropriately and account for safe areas.
- Keep important meme content readable at landscape phone sizes and short desktop heights.

## 15. Motion and interaction details

Use short transitions to clarify user actions:

| Interaction | Suggested behavior |
| --- | --- |
| Button hover | Color/border change, optionally 1–2 px lift |
| Thumbnail selection | Active border plus short stage transition |
| Channel change | Stable page shell and discreet content loading feedback |
| Vote success | Selected reaction state and brief local feedback |
| Generation success | Result panel appears with a short fade |
| Share success | Inline Link copied message |

Timing guidelines:

- Controls: approximately 120–180 ms.
- Panel or image transitions: approximately 180–240 ms.
- Avoid long theatrical entrances or large animated background changes.
- Prefer opacity and transform when animation is useful.
- Respect `prefers-reduced-motion` for transitions and programmatic scrolling.
- No autoplay content cycling, continuous flashing, or scroll hijacking.
- Keep focus stable during content replacement unless a deliberate accessible focus move is needed.

## 16. Loading, errors, and accessibility

### Loading states

- Preserve the size of major image regions to limit layout shifts.
- Use restrained skeletons with the same approximate composition as loaded content.
- Pair long-running generation with readable status text and a disabled submit action.
- Keep actual errors distinct from empty collections.
- An unavailable provider configuration should leave template browsing usable and explain why submission is unavailable.
- Do not use the signal motif to imply a connection or service state that was not checked.

### Accessibility

- Use semantic headings and one clear page-level heading.
- Provide a skip link to main content.
- Ensure readable text contrast on every surface pairing.
- Keep a visible focus ring with adequate contrast on dark and cream backgrounds.
- Support all navigation, thumbnail selection, voting, and creation with the keyboard.
- Associate errors and help text with their fields.
- Preserve actual image descriptions and caption text.
- Do not make decorative technical labels essential to comprehension.
- Do not use color alone for selected, success, pending, or error states.
- Use live regions for meaningful local feedback without excessive announcements.
- Keep source order sensible when CSS changes visual layout.
- If a modal is introduced, implement focus containment, restoration, Escape, and accessible naming completely; prefer normal page layouts when a modal is unnecessary.

## 17. Component and styling approach

Keep authenticated data fetching and server protections on the server. Add client components only for interactions that need local state, such as stage selection and form previews.

Potential reusable pieces:

| Component | Responsibility |
| --- | --- |
| Existing `SiteNav` | Shared station-style navigation |
| `ChannelNavigation` | Topic links with selected state |
| `FeedOrderControl` | Existing sort routes with consistent styling |
| `MemeStage` | Current record selection and prominent display |
| `MemeThumbnailStrip` | Manual stage selection from loaded records |
| Existing `CaptionCard` or shared reaction component | Votes, score, sharing, errors |
| `DailyPromptPanel` | Existing prompt and studio entry link |
| Existing `GenerationForm` | Source selection, context, submission lifecycle |
| Shared status/empty presentation | Consistent readable states |

These are responsibilities, not a requirement to create every listed file. Avoid splitting trivial wrappers into unnecessary components.

### CSS migration

- Replace the warm-yellow global theme with the new coordinated tokens.
- Update shared button, field, panel, navigation, and typography styles together.
- Add explicit dark-surface and paper-surface variants.
- Remove the old hero orb when replacing the signed-in hero.
- Remove unnecessary image blending and decorative zooming.
- Reduce scattered `!important` utility overrides by providing intentional variants.
- Audit old `text-accent`, `bg-white`, and border classes on every page; the new palette changes their meaning.
- Keep styling understandable in the existing Tailwind/global CSS setup.
- Avoid adding an animation or UI framework solely for a few simple transitions.

### Image rendering

- Reuse the authenticated image routes.
- Keep existing access and caching behavior appropriate to private images.
- Update responsive `sizes` values for large stage, detail, grid, and thumbnail contexts; the current shared image component assumes smaller cards.
- Reserve image space before load.
- Prioritize only the visible lead image where compatible with the installed framework and private image handling.
- Let lower-grid and thumbnail images load appropriately without fetching an entire collection eagerly.
- Keep image failure feedback readable under caption overlays.

## 18. Suggested implementation sequence

Execute these only after implementation is requested.

### Step 1: establish the system

Read the applicable project and installed framework instructions. Define tokens, type roles, shared surfaces, controls, focus styles, and navigation. Update the guest screen so the new identity is visible immediately.

### Step 2: build the browsing composition

Replace the signed-in marketing hero with the compact masthead, stage, support column, daily prompt, thumbnail selection, and lower grid. Keep current sorting and pagination working during this step.

### Step 3: connect topic channels

Implement authoritative topic filtering, validated query parsing, reset rules, and pagination preservation. Add channel controls when the data behavior is complete.

### Step 4: refine card interactions

Apply shared card/reaction styles, pending and error states, share feedback, image containment, and container-appropriate caption sizing. Keep state consistent across all representations of a meme.

### Step 5: redesign the studio

Reorganize the existing source browser, preview, and editor into responsive production-desk layouts. Preserve generation/publication semantics and show successful results consistently for every source mode.

### Step 6: complete supporting pages

Update meme detail, profile, onboarding, member welcome, private history, not-found/error presentation, and metadata where appropriate.

### Step 7: review the complete experience

When verification is requested, review representative desktop and mobile states, authentication boundaries, keyboard navigation, and the existing generation/vote workflows. Use the acceptance criteria below. Avoid real provider requests or production writes solely to generate decorative demo content.

## 19. Acceptance criteria for a future review

These are future review criteria, not instructions to run tests while writing this document. When implementation and verification are requested, use focused checks that establish behavior rather than tests that merely mirror CSS or implementation details.

### Visual identity

- The website clearly expresses the Campus After Hours broadcast direction.
- It contains no geographic map or borrowed ocean-game artwork.
- Midnight blue, cream, coral, typography, and rule treatments are consistent across routes.
- The first meme is a clear visual focal point on the signed-in home page.
- Decorative styling leaves images and captions readable.
- Guest and authenticated pages feel like the same product.

### Browsing

- Topic filtering includes matching records beyond the first unfiltered page.
- Changing sort or topic resets pagination.
- Pagination and browser navigation retain the chosen filters.
- Empty, sparse, failed, and text-only data render intentionally.
- Thumbnail selection is manual, keyboard accessible, and reflects actual content.
- Selected stage content and visible vote states remain consistent after updates.

### Creation

- Templates, upload, and generated-image modes remain usable.
- Search, category filtering, selected template, file validation, and context validation work.
- Source previews show complete meaningful images.
- The action label accurately describes immediate publication.
- Successful results are visible for every image source.
- Provider failure, quota exhaustion, and missing configuration have useful feedback.
- Private history remains private.

### Responsive and accessible behavior

- Representative widths include 320, 390, 768, 1024, and 1440 px.
- Long text and short viewports do not hide essential controls.
- Forms remain usable with the mobile keyboard open.
- Every core task is possible with the keyboard.
- Focus, contrast, accessible labels, and reduced motion are handled consistently.
- No fixed control covers meme captions or reaction actions.

### Existing application guarantees

- Guest users cannot read member memes or their images through the redesign.
- Sign-in returns to the intended permitted destination.
- Votes remain one changeable vote per member per meme.
- Sharing preserves member access requirements.
- Upload limits and server validation remain enforced.
- No fake public identities, live counts, quota balances, or provider progress are introduced.

## 20. Definition of a strong result

The result should feel like a thoughtfully designed student publication that happens to broadcast memes: a bold masthead, confident image composition, restrained technical details, and straightforward interaction.

Spend the most design effort on the first screen, image readability, the relationship between browsing and creation, and the mobile layout. Consistency and composition should supply the personality; effects should only support it.

A successful redesign makes visitors recognize the site, enjoy a meme immediately, and understand how to contribute without explanation.
