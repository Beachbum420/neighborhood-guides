# Claude Code — Rework the comps section (remove "renovated" framing)

Single focused change to the El Segundo guide. The current guide has a section titled
"See the upside" that presents "Updated Comp" cards implying renovated comparables. **Remove
that entire framing.** There are no true renovated comps to point to, and the "upside" angle
overpromises. Replace it with two neutral, honest sections that just show the local market.

## What to remove
- The "See the upside" section, its callout box ("The play: Buy at the entry point…"), and all
  cards with the "reno"/"Updated Comp" badge.
- Any copy claiming homes are renovated, updated, move-in ready, or framing a value/upside play.
- Keep the featured listing (700 W Palm) exactly as is — only the comp section changes.

## What to add — two new sections

### Section A: "Similar homes for sale nearby"
Intro line: "A few other El Segundo listings in a similar range, so you can see what else is on
the market." Then cards (badge: "Active", neutral teal badge) for these CURRENT listings. Use
these verified figures; do NOT add condition claims:

- $1,299,000 · 318 Penn St #2 · 3 bd · 3.5 ba · 1,584 sq ft · Townhome
  zillow: https://www.zillow.com/homes/318-Penn-St-El-Segundo-CA-90245_rb/
- $1,750,000 · 758 California St · 4 bd · 1 ba · 1,282 sq ft · Single-family
  zillow: https://www.zillow.com/homes/758-California-St-El-Segundo-CA-90245_rb/
- $1,799,000 · 329 E Maple Ave · 3 bd · 2 ba · 1,561 sq ft · Single-family
  zillow: https://www.zillow.com/homes/329-E-Maple-Ave-El-Segundo-CA-90245_rb/

### Section B: "Recently sold nearby"
Intro line: "Recent El Segundo sales give the truest read on the market." Cards (badge: "Sold",
sand badge). Use these verified recent sales; keep it factual — price, specs, and the sale date
or days-on-market only. No renovation language:

- $2,115,000 · 403 E Pine Ave · 5 bd · 3 ba · 2,193 sq ft · sold Oct 2025 · 7 days on market
  zillow: https://www.zillow.com/homes/403-E-Pine-Ave-El-Segundo-CA-90245_rb/
- $1,763,000 · 804 Hillcrest St · 4 bd · 2 ba · 2,000 sq ft · sold Apr 2026 · 10 days on market
  zillow: https://www.zillow.com/homes/804-Hillcrest-St-El-Segundo-CA-90245_rb/

## Where it goes
Same spot in the page flow where "See the upside" currently sits (after the featured listing,
before the market snapshot). Reuse the existing card component, badge styles, and Zillow-link
styling — just the neutral "Active" and "Sold" badge variants, not the "reno" one. If the "reno"
badge style is now unused, leave it in the CSS (harmless) but don't apply it.

## Data location
This is listing-area market context, but it's specific to this guide's price point — put these
two lists in the **guide's listing.json** (e.g. `similarForSale: [...]` and `recentlySold: [...]`),
NOT the shared neighborhood file, so each open house can show its own comparable set. Update the
template to loop over those arrays. If they're empty/absent, the sections should gracefully not
render.

## After building
Run `npm run build`, serve with `npx serve dist`, and confirm both new sections render with
working Zillow links and no "renovated/updated/upside" language anywhere. Print which files changed.
