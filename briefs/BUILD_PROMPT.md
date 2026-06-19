# Build Prompt — Neighborhood Guide Generator

Paste this entire file into Codex or Claude Code as your initial instruction.
Attach the file `el-segundo-guide.html` (the reference design) alongside it.

---

## What I'm building

A static-site generator for real estate open-house **neighborhood guides**. I'm a
licensed agent (Beach City Brokers, DRE #02185763). At each open house I collect
visitor contact info in exchange for texting them a polished local guide to the
neighborhood + the featured listing. I want to spin up a new guide in minutes per
open house, push it to GitHub, and have it deploy automatically to a public URL I
can text to people.

## Tech constraints (keep it simple)

- Plain **static site** — no React, no build framework heavier than necessary.
- A small **Node.js generator script** (`build.js`) that reads JSON data files and a
  Handlebars (or simple template-literal) HTML template, and writes finished HTML
  pages into `/dist`.
- No database. Each guide is one JSON file in `/guides/`.
- Output must be **self-contained per page** OR reference a shared `/assets` folder —
  your call, but document the tradeoff. Photos live in `/guides/<slug>/photos/`.
- Deploy target: **Cloudflare Pages** connected to the GitHub repo. Build command runs
  `build.js`; publish directory is `/dist`. Include a `wrangler`/Pages config note in
  the README.

## Repo structure to create

```
/
├── README.md                 # setup, how to add a new guide, how to deploy
├── package.json
├── build.js                  # the generator
├── template/
│   ├── guide.html            # the page template with {{tokens}}
│   └── styles.css            # extracted from the reference design
├── data/
│   └── neighborhoods/
│       └── el-segundo.json   # REUSABLE neighborhood content (dining, parks, market, schools)
├── guides/
│   └── 700-w-palm/
│       ├── listing.json      # listing-specific data (address, price, specs, comps, photos)
│       └── photos/           # the MLS photos for this listing
└── dist/                     # generated output (gitignored or committed, your call)
```

## The key design principle

**Separate reusable neighborhood content from per-listing content.** A guide page =
one neighborhood JSON + one listing JSON, merged into the template. When I do a new
open house in the same city, I only write a new `listing.json` and reuse the
neighborhood file. When I expand to a new city, I write one new neighborhood file.

## Data schemas

`data/neighborhoods/el-segundo.json`:
```json
{
  "city": "El Segundo",
  "tagline": "Your local guide to \"the Gundo\"...",
  "market": {
    "median": "$1.75M", "ppsf": "~$979", "daysToPending": "~34", "walkScore": "65",
    "note": "A beach-adjacent city of ~17,000..."
  },
  "dining": [
    {"name":"Porterhouse","desc":"...","rating":"4.8","detail":"223 Richmond St · Dinner"}
  ],
  "coffee": [{"name":"The Coffee Bar","rating":"4.8","detail":"520 Center St · cozy local favorite"}],
  "breweries": [{"name":"Five Point Five","rating":"4.9","detail":"137 Nevada St · Filipino-style pizza"}],
  "parks": [{"name":"El Segundo Beach","detail":"Quiet local beach + Strand bike path"}],
  "schools": [{"name":"Center Street Elementary","detail":"700 Center St · ESUSD"}],
  "essentials": [{"name":"Commute","detail":"Minutes to LAX, the 405 & 105"}]
}
```

`guides/700-w-palm/listing.json`:
```json
{
  "slug": "700-w-palm",
  "neighborhood": "el-segundo",
  "address": "700 W Palm Avenue",
  "listPrice": "$1,599,000",
  "specs": "3 Bed · 2 Bath · 1,732 sq ft · 4,746 sq ft lot · ESUSD",
  "tag": "Bring Your Vision — Renovation Opportunity",
  "blurb": "A rare chance to own a solid, well-located home...",
  "zillowUrl": "https://www.zillow.com/homedetails/700-W-Palm-Ave-El-Segundo-CA-90245/20392018_zpid/",
  "heroPhoto": "photos/hero.jpg",
  "galleryPhotos": ["photos/living.jpg","photos/kitchen.jpg","photos/bed.jpg","photos/living2.jpg","photos/yard.jpg"],
  "comps": [
    {"price":"$1,799,000","badge":"Updated Comp","badgeType":"reno","street":"329 E Maple Ave","specs":"3 bd · 2 ba · 1,561 sq ft · updated & move-in ready","note":"...","zillow":"https://..."}
  ],
  "agent": {
    "name":"Ryan Verbiest","license":"Beach City Brokers · DRE #02185763",
    "phoneRaw":"+13105551234","phoneDisplay":"(310) 555-1234","email":"ryanverbiest@gmail.com"
  }
}
```

## The template

Recreate the page from the attached `el-segundo-guide.html`, but replace all hardcoded
content with `{{tokens}}` and `{{#each}}` loops driven by the JSON above. Preserve
EXACTLY: the color palette (CSS variables --navy #13354e, --teal #2f8f8a, --sand
#e7dcc6, --cream #f7f2e9), the Fraunces + Inter font pairing, the section order, the
hero/scrim treatment, the featured-listing photo gallery grid, the "See the upside"
comp cards with colored badges, the market stat grid, and the agent CTA. Pull the CSS
out into `template/styles.css`.

## build.js requirements

- Read every `guides/*/listing.json`.
- For each, load the referenced `data/neighborhoods/<neighborhood>.json`.
- Merge + render the template → write `dist/<slug>/index.html`.
- Copy each guide's `photos/` into `dist/<slug>/photos/`.
- Optionally generate `dist/index.html` — a simple private index listing all guides.
- Log each page built.

## README must explain (write for a non-developer)

1. How to add a new open house: copy a guide folder, drop in photos, edit `listing.json`, run `npm run build`, commit, push.
2. How Cloudflare Pages auto-deploys on push, and what the Pages build settings should be.
3. How to add a new city (new neighborhood JSON).
4. The branding note: these are Beach City Brokers / real estate pages — keep them
   separate from the Blue Wave construction site.

## Important

Ask me clarifying questions before building if anything is ambiguous. Start by
confirming the repo structure, then build the template, then build.js, then the README.
