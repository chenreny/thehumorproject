# NYC overview and neighborhood scene assets

Generated with the built-in `image_gen` tool for the development-only `/playground` NYC overview-to-street experience. These are clean background images; buttons, animal markers, titles, and meme panels are rendered separately in the application.

All four final WebP files are 1586 × 992, converted with `sharp` at quality 90. Generated PNG originals remain in Codex's generated-images directory. The user's original HEIC and its PNG reference copy are preserved.

| File | Role | Exact prompt |
| --- | --- | --- |
| `overview-night-v1.webp` | Photo-inspired oblique NYC night overview, using the user's skyline/river/bridge photo and the approved night atlas layout as references. | `design/mockups/nyc-live-overview-v1.prompt.md` |
| `campus-night-v1.webp` | A Columbia-inspired campus plaza at night, with student café and activity-doorway areas. | `design/mockups/nyc-live-campus-v1.prompt.md` |
| `east-village-night-v1.webp` | Brick storefronts, a warm food counter, and a softly lit music doorway. | `design/mockups/nyc-live-east-village-v1.prompt.md` |
| `ktown-night-v1.webp` | Taller Midtown storefronts, a warm restaurant frontage, and a karaoke-inspired doorway. | `design/mockups/nyc-live-ktown-v1.prompt.md` |

Reference images: `design/mockups/nyc-night-photo-reference-v1.png`, `sam-nyc-night-atlas-v1.png`, and `sam-nyc-night-street-v1.png`. No new animal or meme photographs were generated. Existing foreground sprites and trusted local animal templates remain in use.

The overview and neighborhood streets are illustrative generated settings, not a navigation map or photographs of specific venues. The skyline photo informs the overview's colors, light, water, and bridge atmosphere; the overview is generated artwork rather than the literal user photo. Region markers and category hotspots are live controls positioned by the component.
