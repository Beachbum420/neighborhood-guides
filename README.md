# Neighborhood Guides — Beach City Brokers

A tiny static-site generator for real-estate open-house **neighborhood guides**.
Each guide is one polished, mobile-first web page you can text to open-house
visitors: the featured listing, the value story, the local market, and your honest
picks for food, coffee, parks, and schools.

The whole idea: **write a little JSON, run one command, push to GitHub, and a public
page goes live automatically.** No database, no website builder, no monthly tool.

---

## How it fits together (the one big idea)

A finished page = **one neighborhood file + one listing file**, merged into a shared
template.

- **Neighborhood content is reusable.** `data/neighborhoods/el-segundo.json` holds
  everything about the *city* — dining, coffee, breweries, parks, schools, market
  stats. You write this **once per city** and reuse it for every open house there.
- **Listing content is per-home.** `guides/<slug>/listing.json` holds everything about
  *one house* — address, price, specs, photos, comps, and the Zillow link.

So a new open house in El Segundo is just **a new listing file + a folder of photos**.
A new *city* is just **one new neighborhood file**.

```
/
├── README.md
├── package.json
├── build.js                         # the generator
├── template/
│   ├── guide.html                   # the page, with {{tokens}} + {{#each}} loops
│   └── styles.css                   # all the colors, fonts, and layout
├── assets/                          # shared brand assets (copied to every deploy)
│   ├── agent/ryan-verbiest.jpg      # your headshot (shows in the CTA)
│   └── brand/bcb-premier-estates.svg# brokerage logo (shows in the footer)
├── data/
│   └── neighborhoods/
│       └── el-segundo.json          # REUSABLE city content
├── guides/
│   └── 700-w-palm/
│       ├── listing.json             # one home's data
│       └── photos/                  # that home's MLS photos
└── dist/                            # generated output — created by `npm run build`
```

---

## One-time setup

You need [Node.js](https://nodejs.org) installed (the LTS version is fine). Then, in
this folder, run once:

```bash
npm install
```

That installs the single dependency (Handlebars, the template engine). After that you
only ever run `npm run build`.

---

## 1. Add a new open house (the common case)

1. **Copy an existing guide folder** as your starting point:
   ```bash
   cp -R guides/700-w-palm guides/123-main-st
   ```
   Use a short, URL-friendly `slug` for the folder name (lowercase, dashes, no spaces).
   This becomes the web address: `…/123-main-st/`.

2. **Drop the MLS photos** into `guides/123-main-st/photos/`. Replace `hero.jpg`
   (the big top image) and the gallery photos. Keep the filenames simple.

3. **Edit `guides/123-main-st/listing.json`** — change `slug`, `address`, `listPrice`,
   `specs`, the `blurb`, the Zillow link, the `comps`, and the photo filenames. Keep
   `"neighborhood": "el-segundo"` if it's in El Segundo (that's what pulls in the city
   content). Your **agent block stays the same** every time — just copy it forward.

4. **Build it:**
   ```bash
   npm run build
   ```
   You'll see `✓ built dist/123-main-st/index.html`. Open that file in a browser to
   preview.

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add 123 Main St open house"
   git push
   ```
   Cloudflare takes it from there (next section). Your live link will be
   `https://<your-project>.pages.dev/123-main-st/`.

> **Tip:** `dist/` is rebuilt from scratch every time and is **gitignored** — you never
> edit it by hand, and you don't commit it. Cloudflare regenerates it on each push.

### What goes in `listing.json`

| Field | What it is |
|---|---|
| `slug` | URL-friendly id; should match the folder name |
| `neighborhood` | which city file to use (e.g. `el-segundo`) — **must match a file in `data/neighborhoods/`** |
| `address`, `listPrice`, `specs`, `tag` | the headline facts |
| `blurb` | the description paragraph (you can use `<strong>…</strong>` for emphasis) |
| `disclaimer` | small print under the Zillow button |
| `zillowUrl` | the "View full listing" button link |
| `heroPhoto` | the big top image, e.g. `photos/hero.jpg` |
| `galleryPhotos` | list of photos; the **first one is shown large** |
| `upside.lead`, `upside.callout` | the "See the upside" intro + highlighted box |
| `comps` | the comparison cards. `badgeType` controls the pill color: `active` (this home), `reno` (updated comp), `sold` (recent sale). Add a `zillow` link to show a "View on Zillow" row |
| `agent` | your name, license line, phone, email, and headshot path — same every time |

---

## 2. How it deploys (Cloudflare Pages)

This repo connects to **Cloudflare Pages**, which rebuilds and republishes every time
you push to GitHub. It's free for this.

**One-time connection:** In the Cloudflare dashboard → **Workers & Pages** → **Create**
→ **Pages** → **Connect to Git**, pick this repo, and set:

| Setting | Value |
|---|---|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node version** | 18 or newer (set env var `NODE_VERSION` = `20` if needed) |

After that, **every `git push` auto-deploys.** No CLI needed.

> Prefer the command line? You can deploy a build with Wrangler instead:
> ```bash
> npm run build
> npx wrangler pages deploy dist --project-name <your-project>
> ```

**Privacy note:** these pages are public at their URL but **not linked from anywhere** —
you share the link by text. `dist/index.html` is a private index of all your guides for
your own convenience; don't hand that one out.

---

## 3. Add a new city

When you start doing open houses in a new city:

1. Copy the El Segundo file as a template:
   ```bash
   cp data/neighborhoods/el-segundo.json data/neighborhoods/manhattan-beach.json
   ```
2. Edit it: change `city`, `tagline`, the `market` numbers, and the `dining`, `coffee`,
   `breweries`, `parks`, `schools`, and `essentials` lists. Update `footerTag` and
   `mapIntro`/`mapNote`.
3. In that city's listings, set `"neighborhood": "manhattan-beach"`.

That's it — every future open house in that city reuses the file.

---

## Neighborhood photos (optional photo bands)

Each city can show four photo bands woven through the neighborhood sections (dining,
market, parks). They're **neighborhood-level** — shared by every guide in that city —
and each one **only appears if its photo file is present**, so missing photos just skip
their band (never a broken image).

**Drop the photos here:** `assets/neighborhoods/<city-slug>/` — for El Segundo that's
**`assets/neighborhoods/el-segundo/`**. Use these exact filenames:

| File | Where it shows |
|---|---|
| `es-beach.jpg` | full-width banner leading the Parks/Outdoors section |
| `es-mainstreet.jpg` | band at the top of the Dining section |
| `es-recpark.jpg` | inset band in the Parks section |
| `es-aerial.jpg` | band at the top of the Market snapshot |

The filenames and captions are defined in the `photos` object of the city's
`data/neighborhoods/<city>.json`. For a new city, copy that block, point it at your own
files, and drop them in `assets/neighborhoods/<new-city>/`. Run `npm run build` and the
bands appear automatically.

---

## Open-house sign-in form (iPad)

A standalone visitor sign-in page builds to **`dist/signin/`** and deploys to
**`<site>/signin`** — open that on an iPad and leave it running on the welcome table.
Guests enter name, phone, whether they're working with an agent, and (optionally) email,
then see a warm "thank you" that auto-resets for the next person.

**Using it at an open house**
1. On the iPad, open `https://<your-site>/signin` in **normal** Safari (not Private mode).
2. Tap "Add to Home Screen" if you want it full-screen, and leave it on the form.
3. Guests sign themselves in; the form resets automatically after each one.
4. **The agent panel** is hidden so guests don't wander into it — **tap the logo 5 times**
   to open it. It shows how many guests signed in today, a **Download leads (CSV)** button,
   and a **Clear leads** button (behind a confirmation).

### ⚠️ CRITICAL — how not to lose your leads
- Leads are saved **only in that iPad's browser** (localStorage). They are **not sent
  anywhere** and are not synced to any server or to Cloudflare.
- **Before you close or clear the browser, tap "Download leads (CSV)"** to save the file.
  If you clear the browser or its site data without downloading first, the leads are gone.
- **Do not use Private/Incognito mode** — localStorage doesn't persist there, so entries
  would vanish when the tab closes.
- Downloaded file is named `open-house-leads-YYYY-MM-DD.csv`
  (columns: Name, Phone, Email, Working With Agent, Time).

### Reusing it for the next open house
Open `template/signin.html` and change the two clearly-marked constants near the top of
the `<script>`:
```js
const LISTING_ADDRESS = "700 W Palm Ave · El Segundo";   // shown in the header
const GUIDE_NAME      = "El Segundo neighborhood guide"; // used in the thank-you message
```
Then `npm run build`. (The page is self-contained — its own inline styles and script — so
it stays reliable even if other assets are slow to load.)

---

## Design notes & decisions

- **Colors, fonts, layout** are preserved exactly from the original design: navy
  `#13354e`, teal `#2f8f8a`, sand `#e7dcc6`, cream `#f7f2e9`, with the Fraunces + Inter
  font pairing. To restyle **all** guides at once, edit `template/styles.css`.
- **Shared CSS (not inlined).** The stylesheet is served once from
  `/assets/styles.css` and linked by every page — it's cacheable and lets you restyle
  everything in one place. The tradeoff vs. inlining the CSS into each page: an inlined
  page is fully self-contained even if saved/opened offline, but it's larger and
  duplicated per guide. Since these pages live at a public URL you text, **shared wins.**
- **Photos:** each home's photos live with that home (`guides/<slug>/photos/`) and are
  copied next to its page. Shared brand assets (your headshot, the brokerage logo) live
  in `/assets/` and are reused by every guide.
- **Agent headshot** is optional per guide: it only appears if `agent.photo` is set in
  `listing.json`. Remove that line and the card still looks right.
- **Footer logo** sits on the cream footer, where the dark navy logo reads cleanly. If
  you ever change the footer to a dark/navy background, the logo would need a light
  container behind it to stay legible.

---

## Branding — keep this separate

These are **Beach City Brokers / real-estate** pages. **Keep this repo and its
Cloudflare project entirely separate from the Blue Wave construction site** — different
brand, different audience, different deploy. Don't cross-link or share assets between
them.

---

## What's next (not built yet)

`briefs/CLAUDE_CODE_map_and_spots.md` is a separate follow-up brief to add a numbered
neighborhood **map** and a few more verified local spots. It's intentionally **not part
of this scaffold** — tackle it as its own step when you're ready.
