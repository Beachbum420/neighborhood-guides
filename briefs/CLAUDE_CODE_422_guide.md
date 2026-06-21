# Claude Code — New open house guide: 422 W Palm Ave (duplex)

Create a NEW guide in the existing system for 422 W Palm Ave, El Segundo. This reuses the
shared El Segundo neighborhood content — you're only creating a new per-listing guide. Do NOT
touch the existing 700-w-palm guide or the neighborhood data.

## Steps
1. Create `guides/422-w-palm/` with a `listing.json` and a `photos/` folder.
2. I will drop 4 photos into `guides/422-w-palm/photos/`:
   - `hero.jpg` (front exterior, Spanish-style)
   - `kitchen.jpg` (front unit kitchen)
   - `rear-unit.jpg` (rear unit living/kitchen — the 1988 unit)
   - `yard.jpg` (backyard showing rear house + stairs)
   NOTE: verify each photo by opening it, do NOT trust the filename — confirm hero is the
   exterior, etc. (We learned the MLS export scrambles filenames.)
3. Build `listing.json` with the data below.
4. `npm run build`, serve, verify, then I'll push.

## listing.json content

```json
{
  "slug": "422-w-palm",
  "neighborhood": "el-segundo",
  "address": "422 W Palm Avenue",
  "listPrice": "$1,899,900",
  "specs": "Front: 3 Bed · 1.5 Bath (SFR) · Rear: 2 Bed · 2 Bath (built 1988) · 8,365 sq ft lot",
  "lat": 33.9223,
  "lng": -118.4205,
  "tag": "Two-on-a-Lot — Income + Build Your Dream Home",
  "blurb": "Opportunity abounds with this classic El Segundo Spanish-style property on a huge 50 x 168 (8,365 sq ft) lot on the desirable southwest corner of town — walking distance to schools, the park, library, beach, and downtown. The front house is a characterful 1920s-era Spanish 3-bed/1.5-bath with dining room, breakfast nook, coved ceilings, and hardwood floors (not livable in current condition — bring your vision). The rear house is a 2-bed/2-bath, 1,000 sq ft unit built in 1988 with a full kitchen. Two 2-car garages off the alley. A perfect chance for an end-user to build their dream home while offsetting the mortgage with rental income, housing extended family, or adding an ADU.",
  "zillowUrl": "https://www.zillow.com/homes/422-W-Palm-Ave-El-Segundo-CA-90245_rb/",
  "heroPhoto": "photos/hero.jpg",
  "galleryPhotos": ["photos/kitchen.jpg","photos/rear-unit.jpg","photos/yard.jpg"],

  "similarForSale": [],
  "recentlySold": [
    {"price":"$1,750,000","badge":"Sold Jan 2026","badgeType":"sold","street":"742 Loma Vista St","specs":"Two-on-a-lot duplex · 3+2 front / 2+1 rear · 2,048 sq ft · 5,257 lot","note":"The closest comp — a detached two-on-a-lot duplex, beautifully updated.","zillow":"https://www.zillow.com/homes/742-Loma-Vista-St-El-Segundo-CA-90245_rb/"},
    {"price":"$2,115,000","badge":"Sold Oct 2025","badgeType":"sold","street":"403 E Pine Ave","specs":"5 bd · 3 ba · 2,193 sq ft · $964/sq ft · sold in 7 days","note":"Shows what a finished El Segundo home commands — the build-your-dream upside.","zillow":"https://www.zillow.com/homes/403-E-Pine-Ave-El-Segundo-CA-90245_rb/"},
    {"price":"$1,763,000","badge":"Sold Apr 2026","badgeType":"sold","street":"804 Hillcrest St","specs":"4 bd · 2 ba · 2,000 sq ft · $882/sq ft · 10 days on market","note":"Recent west-side single-family sale for broader market context.","zillow":"https://www.zillow.com/homes/804-Hillcrest-St-El-Segundo-CA-90245_rb/"}
  ],

  "agent": {
    "name":"Ryan Verbiest",
    "license":"Beach City Brokers · DRE #02185763",
    "phoneRaw":"+13109957741","phoneDisplay":"(310) 995-7741","email":"ryanverbiest@gmail.com"
  }
}
```

## Notes for the template
- This listing has NO "similarForSale" entries (true duplex inventory is thin and I won't show
  mismatched active listings). The template should already gracefully skip an empty array — if
  it doesn't, make it skip the "Similar homes for sale" section when the array is empty.
- Add a short market-context line in/near the comps section (pull from neighborhood data or
  hardcode in this guide): "El Segundo multi-family homes are listing around a $2.2M median and
  selling in ~27 days (spring 2026)." Keep it factual.
- Because this is a duplex with two units, make sure the specs line renders fully and doesn't
  overflow on mobile.

## Finish
`npm run build`, `npx serve dist`, check `/422-w-palm` on a ~380px viewport. Confirm: hero is the
exterior, gallery shows the 3 non-hero photos, the three sold comps render with working Zillow
links, no empty "for sale" section, and the agent/contact block is correct. Then remind me to
`git add . && git commit -m "Add 422 W Palm guide" && git push`.
```
