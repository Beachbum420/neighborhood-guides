# Claude Code — Map + clickable place links (UPDATED, supersedes CLAUDE_CODE_map_and_spots.md)

Two things in one pass: (1) replace the dead "lay of the land" placeholder text with a real
**numbered static map + matching list**, and (2) make **every place in the guide tappable** —
each links out to its Google Maps page (opens directions/hours/reviews). This is NOT a paid
Google Maps API embed — the map is a self-contained inline SVG, and the "clickable" part is
just normal links to maps.google.com place pages. No API key, no billing.

## Part A — Remove the placeholder
In the "lay of the land" / map section, DELETE the placeholder line that currently reads
roughly: "Scan the interactive map I shared, or ask me for the link to the live version."
Replace the whole section body with the map + list described below.

## Part B — Make sure these places exist in data/neighborhoods/el-segundo.json
Add or confirm these (verified — use names/addresses/links verbatim). Each place object should
carry a `mapsUrl` field used both in the map legend and the section listings:

DINING
- Porterhouse · ★4.8 · 223 Richmond St · Dinner · steakhouse
  mapsUrl: https://maps.google.com/?cid=11415002655747031796
- Good Stuff · ★4.7 · 131 W Grand Ave · Breakfast/lunch
  mapsUrl: https://maps.google.com/?cid=2689731930247856173
- Jame Enoteca · ★4.6 · 241 Main St · Italian (THE great Italian spot)
  mapsUrl: https://maps.google.com/?q=Jame+Enoteca+241+Main+St+El+Segundo
- Sausal · ★4.5 · 219 Main St · Mexican
  mapsUrl: https://maps.google.com/?cid=17580...  (if cid unknown, use q= address fallback)
- ¡Jaime! Taqueria · ★4.2 · 450 Main St · Tacos & breakfast burritos
  mapsUrl: https://maps.google.com/?q=Jaime+Taqueria+450+Main+St+El+Segundo

PIZZA / PUB
- The Slice & Pint · ★4.6 · 130 W Grand Ave · NY-style pizza + El Segundo Brewing on tap
  mapsUrl: https://maps.google.com/?q=The+Slice+and+Pint+130+W+Grand+Ave+El+Segundo

COFFEE (Smoky Hollow first)
- Smoky Hollow Roasters · ★4.5 · 118 Sierra St · the coolest local roaster
  mapsUrl: https://maps.google.com/?q=Smoky+Hollow+Roasters+118+Sierra+St+El+Segundo
- The Coffee Bar · ★4.8 · 520 Center St
  mapsUrl: https://maps.google.com/?cid=8690313802223748989

BAGELS / SWEETS
- Uncle Stevey's Bagels · ★4.5 · 213 Richmond St · East Coast-style bagels & babka
  mapsUrl: https://maps.google.com/?q=Uncle+Steveys+Bagels+213+Richmond+St+El+Segundo
- Creamy Boys Ice Cream · ★4.9 · 118 W Grand Ave · NZ-style soft serve, local favorite
  mapsUrl: https://maps.google.com/?cid=11860...  (or q= fallback: Creamy+Boys+118+W+Grand+Ave+El+Segundo)

BREWERIES
- El Segundo Brewing Company · ★4.7 · 140 Main St · the OG
  mapsUrl: https://maps.google.com/?cid=17986701665061556232
- Five Point Five Brewing · ★4.9 · 137 Nevada St · Filipino-style pizza
  mapsUrl: https://maps.google.com/?q=Five+Point+Five+Brewing+137+Nevada+St+El+Segundo

PARKS / BEACH
- El Segundo Beach · 33.9135,-118.4278 · mapsUrl: https://maps.google.com/?cid=16843913457632878526
- Recreation Park · 401 Sheldon St · mapsUrl: https://maps.google.com/?cid=7165887575635930693
- Clutter's Park · ★4.7 · plane-spotting · mapsUrl: https://maps.google.com/?cid=3926806583090465055

For any mapsUrl I left as a partial/unknown cid, use the `q=` address fallback format
(`https://maps.google.com/?q=<name+address+El+Segundo>`) — it resolves reliably.

## Part C — Clickable links everywhere
In the dining, coffee, bagels/sweets, breweries, and parks sections, wrap each place NAME in a
link to its `mapsUrl`, `target="_blank" rel="noopener"`. Style links subtly — keep the existing
look, just make names tappable (e.g. inherit color, optional underline on hover, and a small
↗ or 📍 affordance so people know it's tappable). Don't make it look spammy.

## Part D — The numbered static map
Build an inline SVG numbered map (self-contained, instant, no external requests):
- Project these pins from lat/long to x/y (flip y; document the transform). Assign numbers in
  this order and color-code by category (food=navy, pizza=gold, coffee=teal-brown, bagel/sweets=sand,
  beer=deep teal, park=green):
  1 Porterhouse 33.918603,-118.417486 (food)
  2 Good Stuff 33.919134,-118.417091 (food)
  3 Jame Enoteca 33.918255,-118.416380 (food)
  4 Sausal 33.918013,-118.416167 (food)
  5 ¡Jaime! Taqueria 33.922109,-118.415568 (food)
  6 The Slice & Pint 33.918848,-118.417030 (pizza)
  7 Smoky Hollow Roasters 33.917114,-118.408576 (coffee)
  8 The Coffee Bar 33.922959,-118.404357 (coffee)
  9 Uncle Stevey's Bagels 33.918313,-118.417362 (bagel)
  10 Creamy Boys Ice Cream 33.918863,-118.416723 (bagel/sweets)
  11 El Segundo Brewing Co. 33.917736,-118.415627 (beer)
  12 Five Point Five Brewing 33.917459,-118.403953 (beer)
  13 Recreation Park 33.921435,-118.412002 (park)
  14 El Segundo Beach 33.913523,-118.427811 (park)
- The LISTING renders as a distinct **star/house icon** in brand teal, larger, labeled "Open
  House," placed from the per-guide listing.json lat/lng (700 W Palm: 33.9241,-118.4185).
- Numbers legible on mobile (≥13px); nudge labels to avoid overlap where pins cluster downtown.
- Below the SVG, a numbered legend list matching pins 1:1. **Each legend entry is also a clickable
  Google Maps link** (same mapsUrl). Format: `[n] Name · short detail · ★rating`.
- Keep map data in the NEIGHBORHOOD file (shared); the star marker coords come from listing.json.

## Finish
`npm run build`, `npx serve dist`, verify on a ~380px viewport: placeholder gone, map renders with
the star + 14 numbered pins, legend matches, and every place name (map + sections) opens Google
Maps in a new tab. Print files changed. Note: after this builds and looks right, I'll `git add . &&
git commit && git push` to redeploy on Cloudflare.
