# Claude Code — Add neighborhood photo slots to the guide

Add real photography to the El Segundo neighborhood sections. Right now the listing top is
photo-rich but the neighborhood sections are text-only, which makes the page feel imbalanced.
Fix that with photo bands driven by the neighborhood data, so every El Segundo guide gets them
automatically and future cities just supply their own four photos.

## Photo files
Four photos will be added to the El Segundo neighborhood photo folder (create it if it doesn't
exist — match wherever neighborhood-level assets should live, e.g. `assets/neighborhoods/el-segundo/`
or similar; document the path). Reference them by these exact filenames:

- `es-beach.jpg`      — full-width banner
- `es-mainstreet.jpg` — accompanies the dining section
- `es-recpark.jpg`    — accompanies the parks section
- `es-aerial.jpg`     — wide band near the market/“lay of the land” intro

Some may be missing at first. **Every photo slot must render gracefully if its file is absent** —
no broken-image icons. If a photo key is empty/missing in the data, skip that band entirely.

## Data
Add a `photos` object to `data/neighborhoods/el-segundo.json`:
```json
"photos": {
  "beach":      {"file": "es-beach.jpg",      "caption": "El Segundo Beach & the Strand"},
  "mainstreet": {"file": "es-mainstreet.jpg", "caption": "Downtown Main Street"},
  "recpark":    {"file": "es-recpark.jpg",    "caption": "Recreation Park"},
  "aerial":     {"file": "es-aerial.jpg",     "caption": "El Segundo from above"}
}
```
build.js copies these into the right dist/ location and the template references them by relative
path (consistent with the shared-CSS approach already chosen).

## Placement & styling
- **Beach banner:** full-bleed within the page column, ~220–260px tall, object-fit:cover,
  rounded top corners consistent with the design. Place it as the lead-in to the parks/outdoors
  section. Overlay the caption bottom-left in small white text on a subtle dark gradient scrim
  (reuse the hero scrim treatment so it feels consistent).
- **Main Street:** medium band (~180–200px) at the top of the dining section, same caption scrim.
- **Rec Park:** medium band at the top of the parks section. (If both parks-area photos feel like
  too much stacked, put beach as the section lead and Rec Park as a smaller inset — use judgment,
  keep it clean.)
- **Aerial:** wide band (~200px) near the market snapshot or the map intro, whichever reads better
  in the flow.
- All bands: lazy-load (`loading="lazy"`), responsive, no fixed pixel widths that break mobile.
  Maintain the existing palette and spacing rhythm. Don't let photos crowd the text — keep the
  generous section padding.

## Important
- Keep it tasteful, not a photo dump. Four well-placed bands, breathing room around each.
- These are neighborhood-level (shared across all El Segundo guides), NOT per-listing.
- After building: `npm run build`, `npx serve dist`, confirm bands render when photos are present
  and disappear cleanly when absent. Print which files changed and the exact folder where I should
  drop the four photos.
