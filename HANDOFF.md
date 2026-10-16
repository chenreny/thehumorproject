# Handoff: NYC meme playground

Updated October 13, 2026. Read the current sections first; later sections preserve older lounge and atlas history. This handoff records the implemented state, not authorization to publish or integrate live data.

## Start here

- Workspace: `/Users/renyingchen/Desktop/humanproject`.
- Current Browse homepage: **http://localhost:3000/** (requires sign-in).
- Full meme wall: **http://localhost:3000/?view=feed**.
- Example filtered wall: **http://localhost:3000/?view=feed&location=EastVillage**.
- Development-only comparison: **http://localhost:3000/playground**.
- Original lounge comparison: **http://localhost:3000/demo**. The authenticated homepage and `/create` remain separate existing flows.
- `/playground` is development-only and returns 404 outside development. Reuse the existing localhost:3000 server; do not start a duplicate against the same `.next` directory or stop the user's server.
- The user repeatedly requested **Luna at high effort for implementation**, with root reviewing. Continue that preference for implementation work.

## Latest Create follow-up: Recent Attempts spacing

The user asked to keep Your recent attempts at its bottom-aligned position and bring the studio panel lower. The /create shell again fills the viewport and pushes the history block down when space remains, with 64px top and 48px bottom padding. The history card matches the studio panel's 1340px maximum width and is centered. On desktop above 1200px, the studio panel is shifted down 64px to reduce the gap.

## Previous Create follow-up: spacing below the studio

The user asked for more room between the centered studio panel and Your recent attempts. The /create footer/history wrapper starts 64px below the studio, up from 42px.

## Earlier Create follow-up: roomier center preview

The user asked for the centered panel on /create to be a bit bigger. The cream studio frame now has a 1340px maximum width, up from 1300px, and the desktop grid gives more of that width to the middle picture preview (track proportions .72 / 1.68 / 1). The hero and status widths follow the frame for alignment. The responsive stacked layouts, form behavior, and history gallery are unchanged. No tests, authenticated browser review, provider call, database write, commit, or deployment were run for this sizing change.

## Previous Create follow-up: clear folded gallery control

The user selected **Option A · Clear button** from design/mockups/create-history-expanders/index.html. Luna updated the live /create history summary in src/app/create/page.tsx and src/app/create/create-page.module.css: the folded section is a full clickable dark row with a neutral outlined **Open gallery** action. It shows the private attempt count without any thumbnail peeks or featured attempt. The user then asked to remove the downward arrow from that action, so the live control is text only. When opened, the label becomes **Close gallery** and the existing private image gallery is unchanged. The gallery still starts folded. No tests, authenticated browser interaction, database write, provider call, commit, or deployment were run for this follow-up.

The comparison folder remains available with all three interactive static controls and desktop/mobile PNG previews.

## Previous Create follow-up: folded Recent Attempts image gallery

The user selected **Option A · Image gallery** from `design/mockups/create-recent-attempts/` and asked for it to be folded by default. Luna updated `src/app/create/page.tsx` and `src/app/create/create-page.module.css`. The closed native disclosure now presents a compact, labeled gallery teaser with up to four thumbnails from real saved captions. Opening it shows all queried private attempts, up to 10, in responsive cream cards. Cards use the existing authenticated `/captions/{id}/image` route when a caption exists and a truthful placeholder otherwise; prompt, date, status, and View meme links use the current history data. The gallery starts closed, and its Open/Close gallery affordance replaces the old bare plus/minus marker. Root reviewed the implementation and corrected the mobile grid override so the cards stay in two columns on phones. No database schema or generation action changed; no tests, provider call, database write, commit, or deployment were run.

## Previous Create follow-up: AI source button and Recent Attempts previews

The user chose to keep the current three-column cream `/create` studio and asked for one additional picture-source button beside Upload picture. Luna added **Generate with AI** as an equal third control in `src/app/create/generation-form.tsx` and changed the source picker to three equal columns in `src/app/create/create-page.module.css`. It selects the existing AI generation mode; the generation/publishing action and the preview-footer AI link remain as before. The short source instruction now names all three choices. The live Recent Attempts disclosure is unchanged.

The user also rejected the old Recent Attempts toggle and requested more mockups. Three concepts are at `design/mockups/create-recent-attempts/index.html`: **A · Image gallery** (four image cards), **B · Prompt ledger** (compact prompt-first rows), and **C · Latest + activity** (newest attempt spotlight with earlier attempts listed). Desktop and mobile PNG exports are in that folder's `previews/`. The static mockups use the existing studio style, show a consistent Templates-selected state, and use illustrative attempt data. The user subsequently selected A with a folded default, implemented above.

Luna visually inspected the new mockups and root reviewed a mobile preview. The source-button change was source-reviewed and scoped `git diff --check` passed. No tests, authenticated route interaction, provider call, database action, commit, or deployment were run for this follow-up.

## Earlier Create design exploration: equal picture sources and Recent Attempts

On October 13, the user asked for mockups of a more visible **Create an original picture with AI** entry and a redesign of **Your recent attempts**. Static, mix-and-match previews live at `design/mockups/create-ai-history/index.html`; PNG exports are in `design/mockups/create-ai-history/previews/`, and `README.md` explains the options. These were design artifacts only at that stage.

The first AI mockups promoted AI with a bright tab/card. The user's latest correction supersedes that direction: **AI has the same importance as Templates and Upload picture. Do not highlight or feature AI above the other two.** The mockups were revised accordingly. All three sources now use the same size, base color, and selected-state treatment. Each preview shows AI selected so its own content can be inspected, but any source would get that same selected style. The center preview is empty before generation, as in the real flow; it no longer implies an AI picture already exists.

Earlier source-layout mockups:

| Option | Preview | Design |
| --- | --- | --- |
| Source A | `design/mockups/create-ai-history/previews/ai-a.png` | Three equal tabs in the existing left column. Smallest change from the current two-tab source picker. |
| Source B | `design/mockups/create-ai-history/previews/ai-b.png` | Three equal stacked rows, each with icon, title, and one-line description. More readable in the narrow left column. |
| Source C | `design/mockups/create-ai-history/previews/ai-c.png` | Three equal compact tiles with a shared selected state. |

Recent Attempts mockups remain independent of the picture-source choice. All show the closed default and expanded state:

| Option | Preview | Design |
| --- | --- | --- |
| History 1 | `design/mockups/create-ai-history/previews/history-1.png` | Cream disclosure with a small thumbnail peek; expands to compact rows. |
| History 2 | `design/mockups/create-ai-history/previews/history-2.png` | Dark glass dock; expands to a visual bottom sheet. |
| History 3 | `design/mockups/create-ai-history/previews/history-3.png` | Scrapbook-style image shelf; expands to a longer row. |

The user later chose to keep the current live studio and add one equal AI source button. These earlier source layouts and toggle-based history concepts were not selected. The newer, always-visible Recent Attempts concepts above are the pending design choice. Preserve the existing three-column cream studio, East Village scene, and actual generation/publishing behavior.

The updated static previews were exported from `render-previews.mjs` using local Playwright and visually inspected. The production route, actions, database, provider, tests, lint, build, commit, and deployment were not exercised for this design work.

## Current Browse homepage

On October 13, 2026, the user asked to replace Browse's content with Playground. Luna moved the NYC map, neighborhood viewer, and All memes wall to the authenticated `/` route. The old CampusRoom UI is no longer rendered on Browse; its files remain in the worktree. The homepage loads up to 600 newest published captions through the existing signed-in feed function and mixes them ahead of the 26 curated examples. Published cards link to the canonical meme page for saved voting; curated examples have distinct labels and local-only ratings. Campus, Ktown, and East Village filters remain available in the wall. The existing sign-in screen still guards `/`, and the Playground header now offers Create, Profile, and Sign out. `/playground` remains a development-only comparison, using the same component without the production account controls.

Browse URLs use `/?view=feed&location=...`. The sign-in redirect allowlist preserves these filters, and legacy `/?scene=...` return links map to a relevant Browse location. The `/create` footer returns to the matching location for an incoming room scene. The header wraps on narrow phones, and a skip link reaches the active viewer or wall. After the user asked for the right panel to stay exactly like Playground, the scene viewer was restored to the original 26 curated samples, initial `east-food-slice` at 19/26, and its local rating controls. Published captions remain in the All memes wall and its location filters. At 1440×1000, the current `/playground` viewer measured 461×523 pixels and visually matched `design/previews/playground-overlay-desktop.png`; the CSS still sizes it as `clamp(390px, 32vw, 490px)` and changes to a stacked layout at 1250px or below. The latest work was source-reviewed and `git diff --check` was clean; no test suite, lint, build, provider call, commit, or application deployment was run.

The user then asked to keep text off the subway dog's face and specifically rejected a separate caption strip. The three curated `/room/animals/subway-dog.webp` memes now keep the full photo and panel size, while only their top caption uses a smaller single line positioned at the top. This applies to the scene viewer and matching All memes cards; other meme images and bottom captions retain their existing placement.

The standalone All memes summary line (for example, “9 memes · 0 published”) was removed. Location filter chip counts remain visible.

## Current `/create` studio direction

### October 13 location follow-up

The `/create` territory choices now match Playground's filters: Campus, Ktown, and East Village. The stored East Village key is `EastVillage`; the UI shows a readable space. `src/lib/generation.ts` owns these keys, and `supabase/migrations/20261013000000_location_topics.sql` expands the two topic constraints while keeping existing NYC and Dorm life rows valid. The user approved applying this migration on October 13, 2026. `supabase db push --linked --skip-vault --yes` applied it to the linked project after a dry run showed only that file pending; `supabase migration list --linked` confirmed its local and remote versions match.

Recent Attempts is a native disclosure closed by default. The create page uses the East Village night scene as its background. In development, `/playground` combines its curated examples with up to 600 newest published caption-feed memes for signed-in users and places published memes ahead of examples under the corresponding Campus, Ktown, or East Village filter. Existing NYC captions map to East Village and Dorm life to Campus. Published cards open their canonical meme pages for saved voting; preview ratings remain local. The Playground gate still returns 404 outside development, so this is a local view of live published memes, not a production wall. No test suite, lint, build, provider call, or application deployment was run in this follow-up.

The user chose Source 1 from `design/mockups/create-concepts/` and asked for two visible picture sources on the left: **Templates** and **Upload picture**. Luna implemented a single cream three-column studio card over the NYC night scene in `src/app/create/generation-form.tsx` and `src/app/create/create-page.module.css`. The left gallery has all 13 templates with no search or filter controls; on desktop it scrolls inside the left column. Upload mode uses the Source 3-style dropzone, file summary/removal, and a preview of the chosen image. The middle column shows the selected picture; the right column keeps the real topic, prompt, authentication, quota, and publishing controls. A valid incoming template still overrides the default selection; otherwise Disaster Girl starts selected. The previous AI image generation flow remains available from a small link below the preview rather than a third left-side choice.

Root visually reviewed the final template and upload states at 1440px and the upload state at 390px through a temporary preview route, which was removed. Captures are `design/previews/create-source1-template-final.png`, `create-source1-upload-final.png`, and `create-source1-upload-mobile-final.png`. The authenticated `/create` route, generation action, database, and provider were not exercised. No test suite, lint, build, commit, or deployment was run.

## Earlier `/create` visual alignment (superseded)

The user rejected the first color-only `/create` restyle and asked for the playground composition. Luna rebuilt the authenticated route around the same NYC night artwork: a 70px navy radio header, compact scene title, translucent and scrollable template choices over the left of the photograph, and one floating cream editor over the right. Template, upload, and generated-image modes remain available. At widths of 1200px or less, the choices and editor stack over the scene and use normal page scrolling; selecting a template brings the editor into view. The changes are scoped to `src/app/create/page.tsx`, `src/app/create/generation-form.tsx`, and `src/app/create/create-page.module.css`. Shared navigation/global styles, auth, generation actions, template validation, and private history data access remain unchanged.

Root reviewed a temporary development preview of the form at 1440×1000, 390×844, and 320×640, including all three image modes and a selected template. The preview route was removed. Review fixes made the upload chooser and icon readable, improved disabled button contrast, and removed 320px horizontal overflow. Screenshots are `design/previews/create-scene-desktop.png`, `create-scene-mobile.png`, and `create-scene-mobile-generate.png`. The authenticated `/create` route itself, generation action, database, and provider were not exercised; no test suite, commit, or deployment was run.

## Product intent and accepted decisions

The purpose is to **view, rate, and create memes**. The target persona is Sam, a chronically online Columbia College junior from the Midwest, living in the dorms and exploring NYC on weekends. Keep the city exploration simple and useful: choosing a neighborhood or animal theme opens relevant memes. Avoid adding story paragraphs, game progression, or navigation controls that compete with the meme.

The user approved a night atlas overview inspired by their photo, transitioning to a realistic neighborhood street scene after clicking an area. Cute animals remain useful as clickable neighborhood markers and theme hosts; meme content now mixes animal photos with classic non-animal templates.

The final simplification requests, in order:

1. Remove generic All/Food/Clubs controls from the left; use themes appropriate to each location.
2. Make All memes a dedicated grid with location filters **only on that page**.
3. Remove Campus/Ktown/East Village tabs from the city view; choose areas on the map.
4. Add non-animal samples using existing `/create` gallery assets.
5. Remove right-side Up Next thumbnails and the “5 more”/“7 more” row.
6. Remove the right-side subtitle, metadata, and preview-note lines; remove its contextual Create button. Keep the header Create meme link.
7. Restore the small **current / total** counter at the card's top right. This is the intentional exception to removing small viewer text.
8. Replace the wordmark with the original **blue radio/crown logo**, not a column emoji. Brighten it slightly to distinguish it from the navy background.

Do not reintroduce removed controls or explanatory text during cleanup. The “Campus After Hours” heading still exists in the older lounge; it is no longer the playground header wordmark.

## Current implementation map

| File | Responsibility |
| --- | --- |
| `src/app/playground/page.tsx` | Development gate, async search parameters, allowlisted initial feed/location. |
| `src/components/campus-diorama.tsx` | Three neighborhoods, six themes, 26 samples, camera/feed state, local ratings, counter, history/focus behavior, radio header. |
| `src/components/campus-diorama.module.css` | Isolated layout, shared canvas, transitions, mobile targets, custom cursors, image fitting, brighter logo. |
| `public/room/playground/nyc/ASSET_NOTES.md` | Generated background roles, reference images, exact prompt paths, provenance. |
| `public/room/playground/animal-sprites-v1.webp` | Existing foreground animal atlas; reused. |
| `public/room/animals/` and `public/meme-templates/` | Existing local animal photos and classic meme templates; reused. |
| `public/room/radio-v5.webp` | Original radio/crown logo; asset unchanged, brightness applied only through playground CSS. |

### State and continuation details

- The initial overview's viewer covers all 26 samples and starts with `east-food-slice`, so the restored counter initially reads **19 / 26** with the current ordering. The denominator is the current collection size, not a vote count.
- Collections: Campus 9 (Study 5, Dorm life 4), Ktown 9 (Late bites 5, Karaoke 4), East Village 8 (Cheap eats 4, Live music 4).
- Camera `view`/`regionId` are separate from `collectionRegion`/`themeId`/`selectedId`. Map return keeps the collection and rating, then focuses its marker. Entering a neighborhood selects its first sample and clears the selected theme; Previous/Next wraps within the collection.
- `ratings` is keyed by stable sample ID and shared between the scene viewer and feed cards. Clicking the same rating again clears it. All state is in React memory and resets on reload.
- Feed entry uses native `pushState`; location chips use `replaceState`. A `popstate` handler updates the screen and moves focus. Back to city uses history when entered from the city; direct feed links return in place. Neighborhood/theme/featured selections are not encoded in the URL.
- The canvas is measured with ResizeObserver: desktop cover, mobile contain, common 1586:992 dimensions for background and markers. Its effect depends on `feedOpen` so it observes the scene again after returning from the grid. Preserve cleanup and avoid overlapping 44px mobile marker targets.
- The featured Image is keyed by sample ID to prevent new captions appearing over a retained old image. Classic templates use `contain` to preserve full multi-panel frames; animal photos use `cover`. Wait for image decoding when taking captures.
- Fine-pointer cursors are 24px cream/coral SVGs with native fallbacks: star on surfaces, hand/spark on controls. Text retains the I-beam and coarse pointers use native cursors. Keep these rules after control styles so specificity does not override them.
- Logo box: 80×52px desktop, 66×46px mobile. CSS treatment: `brightness(1.4) saturate(1.12)` with a warm halo and dark shadow. Preserve the existing 70px desktop header geometry.

### Earlier limits and safe continuation (superseded by the location follow-up above)

The wall is a curated local preview, not a live feed or a copy of private creation history. The eight new classic samples reuse four existing template images with newly written captions. Ratings do not call the real vote action. The global Create link opens the existing `/create` flow; generation, authentication, publishing, and live filtering were not exercised in this pass. Generated city scenery is illustrative and not geographically accurate navigation data.

Do not integrate this into the production homepage or remove its development gate without a new request. Read `AGENTS.md` and relevant installed guides under `node_modules/next/dist/docs/` before application code changes. Preserve the shared worktree's existing modifications and untracked artwork; do not reset, clean, stage, commit, or deploy as part of continuation. The existing DB/provider-backed E2E suite can create users and make provider calls; do not run it without explicit authorization. No tests were run for this documentation-only update.

## Latest direction: `/playground` neighborhood themes and full meme wall

Luna implemented this development-only `/playground` iteration at high effort; root reviewed the source and final layouts. The street scenes now use neighborhood-specific animal hotspots, and the shareable full browsing view includes both animal photos and classic templates already present in the local `/create` gallery. The implementation is limited to `src/app/playground/page.tsx`, `src/components/campus-diorama.tsx`, its isolated module stylesheet, and this handoff section.

### Scene overlay follow-up

The playground city view now fills the desktop stage, with the meme viewer floating over the right side of the scene. The artwork and its interactive markers shift left together, while a navy fade blends the scene beneath the card and leaves the hotspots bright. At widths of 1250px or less, the viewer overlaps the lower edge of the scene and the page scrolls naturally. The street hint is hidden on small screens because it crowded the theme hotspot. The full meme wall is unchanged. Local desktop and mobile captures confirmed the overview and East Village street controls remain visible, clickable, and free of horizontal overflow. Captures are `design/previews/playground-overlay-{desktop,mobile}{,-street}.png`. No test suite was run for this style-only follow-up.

### Current comparison behavior

- The persistent generic All/Food/Clubs row and the neighborhood tab row are removed. Neighborhoods are selected from the map markers; Map returns from a street scene to the overview. Each neighborhood has two animal hotspots: Campus has Study and Dorm life; Ktown has Late bites and Karaoke; East Village has Cheap eats and Live music. Pressing a hotspot selects its themed local meme collection; the viewer keeps a single collection heading above the meme.
- **All memes** opens a full browsing page at `/playground?view=feed`. The grid contains all 26 local preview samples: 18 existing animal-photo fixtures plus eight captioned classic-template fixtures. The added samples use only existing local assets `public/meme-templates/hide-the-pain-harold.jpg`, `one-does-not-simply.jpg`, `disaster-girl.jpg`, and `waiting-skeleton.jpg`; no remote images are requested. Sample data retains the corresponding local template IDs as fixture provenance. The global header Create meme link remains a blank `/create`; the feed cards and city viewer have no contextual Create actions.
- Feed location filters appear only on the All memes page: All locations, Campus, Ktown, East Village. Their counts are calculated from the sample data (26 total; Campus 9, Ktown 9, East Village 8). Deep links accept `location=Campus`, `location=Ktown`, or `location=EastVillage`; unknown values resolve to All locations. Feed cards show the image, captions, neighborhood/theme, and local rating controls. Classic template images fit their full frame; animal photos retain cover cropping.
- The city viewer has one collection heading, a small accessible current-position/total counter for the visible collection, the full meme caption text, ratings, and Previous/Next. It has no contextual Create link, location/theme subtitle, image metadata row, preview note, Up Next thumbnail grid, or remaining-meme count. Fixture status appears in the All memes footer and this handoff. Featured and feed-card ratings share stable IDs and React-memory state.
- Back to city uses the browser history entry created by opening the feed. It restores the scene, collection, active theme, featured meme, and ratings held by the still-mounted client component; the scene DOM is rendered again. Direct feed deep links return to `/playground` in place. Location filters update the URL without adding one history entry per filter.
- The five existing animal photos are reused; no database, vote action, provider integration, or new backend behavior was added. Preview ratings reset on reload. The `/playground` development gate remains in place.
- The playground has small cream/coral SVG cursors: a star on fine-pointer surfaces and a related hand/spark on links and buttons. These rules follow the control styles and have enough selector specificity to apply. Headings and caption text keep an I-beam; coarse pointers use native cursors. Neighborhood markers and theme hotspots remain keyboard controls with visible focus. The measured 1586:992 canvas remains responsive; mobile street scenes reserve the upper-right corner for Map.
- The playground header uses the existing blue radio/crown artwork at `/room/radio-v5.webp` as a decorative image inside an accessible home link. Its image box is 80×52px on desktop and 66×46px on mobile, without a tile background. A small brightness/saturation lift and warm shadow make it stand out against navy. The artwork stays on one row with the navigation actions at narrow widths; in the feed view, it returns to the city while preserving the mounted scene state.

### Scope and validation status

This iteration changes only the playground route/component/style and this latest handoff section. `npm run lint`, `npm run build -- --webpack` (including TypeScript), and `git diff --check` passed at the end of the theme/feed/classic-image implementation. Later counter and radio-logo changes passed scoped component ESLint and `git diff --check`; the radio brightness follow-up passed `git diff --check` and received desktop/mobile header visual review. A full build was not rerun after those small follow-ups. Root captured and visually reviewed the overview, all three neighborhood themes, classic-template viewer, full meme wall, and city return at 1440 × 1000, 390 × 844, 320 × 480, and 844 × 390. Captures showed 26 grid cards, location counts 26/9/9/8, retained themed collection on city return, and no horizontal overflow. No browser application or console errors were reported. Full-layout captures are `design/previews/nyc-themes-*.png`, `nyc-classic-meme-*.png`, and `nyc-meme-wall-*.png`; they precede the restored counter and radio-logo follow-ups. The latest header captures are `design/previews/nyc-radio-header-1440.png` and `nyc-radio-header-390.png`, showing the brightened radio. External requests, studio/auth navigation, and POST requests were blocked during capture. Source review covered shared local rating state, allowlisted feed queries, cursor specificity, accessible live announcements, and observer cleanup. Hash checks confirmed `/demo`, the authenticated homepage, lounge components, and global stylesheet stayed unchanged. The create application, template allowlist, and backend/data paths were not edited. No test suite, DB/provider action, server start/stop, staging, commit, or deployment was performed. The feed is a local fixture comparison, not live member content; ratings reset on reload.

## Historical reference: earlier atlas iteration

## Previous iteration: NYC neighborhood overview and street view · October 12, 2026

The user requested Luna at high effort to implement the approved `/playground` iteration. Luna implemented and fixed the interface; root generated clean scene artwork and reviewed the source and browser behavior. The development-only route now starts on a photo-inspired NYC night overview, with Campus/Columbia, Ktown, and East Village markers. Selecting a marker or neighborhood tab zooms toward its area and crossfades into a cinematic street scene like the approved street mockup. The Map control returns to the overview, keeps the current region/category/featured meme, and restores keyboard focus to the selected neighborhood marker. All memes resets the overview and the full collection.

- Overview and street artwork paths are `/room/playground/nyc/overview-night-v1.webp`, `campus-night-v1.webp`, `east-village-night-v1.webp`, and `ktown-night-v1.webp`. The region data uses overview coordinates Campus 53%/18%, Ktown 55%/53%, and East Village 65%/68%. A ResizeObserver measures one shared 1586:992 canvas for the artwork and its markers/hotspots; desktop fills the scene viewport and mobile contains the full canvas below a two-row HUD, keeping the northern Campus target clear. Street Food/Clubs hotspot coordinates live with each region (32%/58% and 77%/66%).
- Street mode exposes Food and Clubs animal hotspots plus All/Food/Clubs category controls. Each of the three regions has two Food, two Clubs, and two general campus or city-life fixtures. Category filtering preserves the region; switching regions resets the category to All. Brief keyed reactions appear on the relevant neighborhood animal, Food/Clubs host, or general street host.
- Fixture IDs remain stable and ratings remain local to each meme across region, category, and view changes. Previous/Next wraps within the filtered set, Up Next shows at most three other samples, and the preview note makes fixture status clear. The contextual Create link only uses Campus or NYC topics with the existing campus raccoon or NYC dog templates. The global Create meme link remains a blank `/create` route.
- Existing animal sprite atlas and animal photos are reused. This change is limited to the existing playground component, its CSS module, and this handoff section; no backend, database, authentication, provider, or dependency changes were made.
- All four clean 1586×992 scene assets are present. Small-screen map targets are separate 44px buttons with nonintercepting labels. Artwork, reference roles, and exact prompts are documented in `public/room/playground/nyc/ASSET_NOTES.md` and `design/mockups/nyc-live-*-v1.prompt.md`.

### Validation and remaining limits for the NYC iteration

`npm run lint`, `npm run build -- --webpack` (including TypeScript), and `git diff --check` passed. Local browser review passed at 1440 × 1000, 390 × 844, 320 × 480, and 844 × 390. Checks covered all 18 unique samples; all three neighborhood areas and tabs; six samples per neighborhood and two per Food/Clubs filter; browsing wrap; Up Next exclusion/count; per-meme ratings and keyboard toggling; retained collection/filter/rating and marker focus on Map return; global All memes reset; trusted topic/template studio links; readable images; no horizontal overflow; and rapid neighborhood switches. Normal-motion checks verified zoom/crossfade into the selected scene, return animation, and transient reaction cleanup. All scene assets served successfully, with no application or console errors in the final run.

Review fixes addressed a wrong Campus image URL, inactive street layers covering the overview, accidental collection broadening on Map return, canvas sizing, mobile HUD obstruction, overlapping small-screen neighborhood targets, and reachable 44px controls. Initial meme and rating controls fit at 1440 × 1000 and 390 × 844; smaller/landscape phones scroll naturally. Final captures are `design/previews/nyc-overview-{1440,390,320,844}.png` and `nyc-east-village-{1440,390,320,844}.png`.

This remains a development-only fixture comparison. Collections and ratings are local; ratings reset on reload and do not call the real vote action. The existing authenticated studio is reached through direct links, but live auth/generation/publication actions were not exercised. The overview is generated artwork inspired by the user's night photo rather than a literal photo or navigation map; street scenes are illustrative settings rather than specific venue photos. The original image and all earlier artwork/mockups remain preserved. No new dependencies, DB writes, provider-backed tests, deployment, commit, staging, or new dev server were involved. Browser checks blocked external requests, studio/auth navigation, and POST requests. Hash checks confirmed the authenticated homepage, `/demo`, lounge components, and global stylesheet stayed unchanged.

Updated October 12, 2026. This is a working handoff for the current implementation, not a new product brief.

## Earlier lounge implementation context

The Humor Project is a campus meme community. **Campus After Hours** is the current creative direction. The approved v5 lounge artwork is the home base, with the meme remaining prominent and readable. The user rejected an early CSS-only schematic that looked unlike v5, so retain the painted room illustration and radio artwork in `public/room/`.

The user then clarified that exploration needed to feel like a connected experience, not a collection of decorative controls or a hidden dialog menu. The accepted flow is a compact, exploration-style website: enter the room, travel to a distinct place, choose a moment in that scene, make a meme with that animal/context, and return to the room. This does not call for a full game: there is no avatar walking, challenge system, score, or progression to add.

Animal photography is intentional and user-requested. The five static room photos show a library cat, campus raccoon, subway pizza dog, dorm cat, and dining hall cat. Preserve existing published member meme images; these animal images are for the new room scenes, local preview fixtures, and trusted new studio templates. Do not migrate existing content or send fixture images to an external provider.

An earlier lounge UI request was to show **at most three Up Next memes, excluding the featured meme**; this remains specific to the lounge and does not describe the current `/playground` viewer. The demo implements that behavior, and the real member feed already uses the same three-item cap. The destination chooser still has five places.

## Earlier lounge behavior (`/` and `/demo`)

- The authenticated home route remains the real member feed. Its browse/vote/create behavior and existing data remain in place. The approved v5 composition is retained as the lounge.
- “Explore the room” opens a full destination scene. Library, Campus, Subway, Dorm, and Dining Hall each use their own animal photo, location label, short mood, and clickable situation hotspots. The destination fills the view so it reads as an arrival, rather than a modal over the unchanged lounge. The return control restores the room and its allowlisted `scene` query.
- Choosing a hotspot updates the editable situation. “Make a meme here” carries the selected scene, topic, prompt, and trusted animal template into `/create`.
- `/create` validates the scene/template against allowlists, selects the matching local animal template, and preserves approved context through the sign-in redirect. The real authenticated studio still uses the existing generation/publication actions.
- `/demo` is a development-only static playground, gated in `src/app/demo/page.tsx`; it returns 404 outside development. Its sample memes, scene navigation, editable caption preview, and return flow are local only. The preview explicitly makes no AI call and does not publish or save data. It contains no DB/provider-backed demo interactions. Up Next excludes the selected sample and renders at most three cards.
- Real votes continue to use the existing action/revalidation flow; the demo does not show fake vote rewards or counts.

## Interaction follow-up

The user requested more interactivity after reviewing this handoff. Luna implemented the follow-up at high effort; root reviewed the source and local browser behavior.

- Both lounges now have a visible five-place destination rail. Each photo button opens its exact scene directly; Up Next still has at most three memes and excludes the featured meme.
- All 15 scene moments now change the visible scene context, a short animal/story response, and a matching suggested caption. These are curated suggestions, not AI-generated results.
- The development-only composer uses captions specific to the current scene and moment. Typing updates its preview immediately; clean/meme typography and caption reset are available. Draft captions, edited scene context, and selected moments remain in browser memory while switching scenes and returning to the lounge. Reloading clears them.
- Scene arrival, composer entry, and return move keyboard focus to relevant controls. Covered lounge/feed controls are inert during exploration. Mobile has scrollable story/editor panels and a compact moment selector for short viewports; reduced-motion styling remains supported.
- Authenticated scene travel and return preserve the current feed sort and page; returning restores the featured selection captured when exploration began. Studio context still uses the existing scene/template allowlists and generation actions.

## Main implementation map

| Path | Responsibility |
| --- | --- |
| `src/lib/room-scenes.ts` | Five allowlisted scenes, topics, prompts, situations, photos, and `roomScene` validator. |
| `src/components/room-explorer.tsx` | Shared destination navigation, hotspots, context handoff, and demo-only manual composer. |
| `src/components/room-destination-rail.tsx` | Shared five-place lounge chooser with direct scene entry. |
| `src/components/campus-room.tsx` | Authenticated lounge/feed, real three-item Up Next, topic selection, and scene entry. |
| `src/components/demo-room.tsx` | Local sample lounge and three-card Up Next behavior. |
| `src/app/demo/page.tsx` | Development-only route gate. |
| `src/app/page.tsx` | Authenticated feed entry; validates `scene` query before passing it into the room. |
| `src/app/globals.css` | v5 lounge styling, immersive full-view scenes, responsive layouts, reduced-motion behavior, and animal preview. |
| `src/app/create/page.tsx`, `src/app/create/generation-form.tsx` | Validated studio context and selected curated animal template. |
| `src/app/create/actions.ts`, `src/lib/templates.ts` | Existing generation path plus trusted local template file resolution; do not relax its validation. |
| `src/lib/auth-redirect.ts` | Restricts redirect destinations and preserves only allowlisted room/template context. |
| `next.config.ts` | Includes the local animal WebP files in `/create` output tracing. |
| `tests/generation.test.mjs` | Unit checks for prompt validation, auth-context handoff, and trusted local template resolution. |

Room artwork and its generation prompts/provenance are in `public/room/ASSET_NOTES.md`. The browser preview images are in `design/previews/`. The reference design is `design/mockups/campus-after-hours-desktop-v5.png`.

## Earlier lounge preview and checks

Use **http://localhost:3000/demo** to inspect the older local lounge. The current NYC comparison is **http://localhost:3000/playground**. It returned HTTP 200 after the latest edits. Reuse the existing server; avoid starting a second Next dev server against the same `.next` directory or killing the existing process.

Earlier lounge interaction-pass verification: `npm test` passed 6/6, `npm run lint` passed, `npm run build -- --webpack` passed, and `git diff --check` passed. Local browser checks covered all five direct destinations and all 15 distinct moment responses; caption defaults, typing, typography, reset, draft retention, focus, composer dismissal, and return; desktop, 390 × 844 mobile, 320 × 480 short mobile, and 844 × 390 landscape layouts. No browser JavaScript errors were observed. The demo returns 200 on the existing development server. A separate temporary production server returned 404 for `/demo` and was stopped after that check. Root's final review fixed active-scene navigation positioning and landscape panels that could cover the return button.

New captures: `design/previews/campus-after-hours-interactive-lounge.png`, `campus-after-hours-interactive-subway.png`, `campus-after-hours-interactive-mobile.png`, and `campus-after-hours-interactive-composer.png`. Older previews remain intact. Browser verification used the local demo with external requests blocked. Authenticated feed/vote/generation flows were not exercised against live services; production components and routing were source-reviewed and type/build checked. Drafts remain local and reset on reload.

Do **not** run `tests/browser/app.spec.ts` or other DB/provider-backed E2E tests without explicit authorization: the existing browser suite can create database users and make provider calls. No test user, DB write, provider call, deployment, commit, or staging was performed for this work.

## Continuation guidance

- The user prefers Luna to execute the work directly and with high effort; root reviews. This preference was followed for the interaction pass.
- Preserve the current product constraints: member authentication, private generation history, topic/prompt validation, image access, votes, and generation quotas. Keep fixture/demo behavior separate from production data and actions.
- Topic filtering on the authenticated room applies to the currently loaded feed batch; the feed API itself has not gained a topic filter.
- Before any further application code change, follow `AGENTS.md` and read the relevant guide from the installed `node_modules/next/dist/docs/` (installed Next is 16.3.8). Installed docs were read for the room implementation; do not rely on remembered APIs.
- The shared worktree contains multiple existing modifications and untracked material, including `UI_REDESIGN_BRIEF.md`, `design/`, and `example/`. Inspect `git status` before editing and preserve those files. Do not reset, clean, stage, or remove work as part of continuation.
- Some older descriptive text is now stale: `UI_REDESIGN_BRIEF.md` says implementation has not started, and `design/previews/README.md` says the fixture route was removed. The current route is `/demo` in development only. These older files were left untouched; update them only if separately requested.
