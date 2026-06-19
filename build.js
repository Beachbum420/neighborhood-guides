#!/usr/bin/env node
/* ============================================================
   Neighborhood Guide Generator
   ------------------------------------------------------------
   Reads each guides/<slug>/listing.json, merges it with the
   reusable data/neighborhoods/<neighborhood>.json it points to,
   renders template/guide.html (Handlebars), and writes a finished
   page to dist/<slug>/index.html.

   Shared styles + brand assets (your headshot) are copied once to
   dist/assets/ and referenced by every page via root-relative paths
   (/assets/...). Per-listing MLS photos are copied to
   dist/<slug>/photos/ and referenced with relative paths (photos/...).

   Run:  npm run build      (or:  node build.js)
   ============================================================ */

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const ROOT = __dirname;
const TEMPLATE_DIR = path.join(ROOT, "template");
const GUIDES_DIR = path.join(ROOT, "guides");
const NEIGHBORHOODS_DIR = path.join(ROOT, "data", "neighborhoods");
const ASSETS_DIR = path.join(ROOT, "assets");
const DIST_DIR = path.join(ROOT, "dist");

// {{inc @index}} → 1-based numbering for the ranked dining list.
Handlebars.registerHelper("inc", (value) => Number(value) + 1);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Keep only the neighborhood photos whose file is present on disk, attaching a
// root-relative `src` (consistent with the shared /assets/ approach). Returns a
// fresh object; absent or unspecified photos are dropped so their band is skipped.
function resolveNeighborhoodPhotos(photos, neighborhoodSlug) {
  const resolved = {};
  if (!photos) return resolved;
  const srcDir = path.join(ASSETS_DIR, "neighborhoods", neighborhoodSlug);
  for (const [key, photo] of Object.entries(photos)) {
    if (!photo || !photo.file) continue;
    if (fs.existsSync(path.join(srcDir, photo.file))) {
      resolved[key] = {
        ...photo,
        src: `/assets/neighborhoods/${neighborhoodSlug}/${photo.file}`,
      };
    }
  }
  return resolved;
}

// Category → marker colors. Single source of truth for both the SVG pins and
// the HTML legend badges. bagel/sweets uses sand, so it needs dark ink.
const MAP_COLORS = {
  food:   { fill: "#13354e", ink: "#ffffff" }, // navy
  pizza:  { fill: "#c9a24b", ink: "#13354e" }, // gold (dark ink for contrast)
  coffee: { fill: "#6d5a43", ink: "#ffffff" }, // coffee brown
  bagel:  { fill: "#e7dcc6", ink: "#5a4a2a" }, // sand
  beer:   { fill: "#236f6b", ink: "#ffffff" }, // deep teal
  park:   { fill: "#5d7a3a", ink: "#ffffff" }, // green
};
const MAP_FALLBACK = { fill: "#5f6f79", ink: "#ffffff" };

function catColor(cat) {
  const key = String(cat || "").split("/")[0].trim();
  return MAP_COLORS[key] || MAP_FALLBACK;
}

// Five-pointed star polygon points centered at (cx,cy).
function starPolygon(cx, cy, ro, ri, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// Build a self-contained inline SVG neighborhood map from the shared map pins
// plus the per-listing star coordinates. Also annotates each pin with its
// legend badge colors. Returns "" when there are no pins (caller hides the block).
function buildMapSvg(neighborhood, listing) {
  const map = neighborhood && neighborhood.map;
  if (!map || !Array.isArray(map.pins) || map.pins.length === 0) return "";

  // Color every pin — reused by the SVG below and the legend in the template.
  for (const p of map.pins) {
    const c = catColor(p.cat);
    p.color = c.fill;
    p.textColor = c.ink;
  }

  const hasStar =
    listing && typeof listing.lat === "number" && typeof listing.lng === "number";
  const star = hasStar ? { lat: listing.lat, lng: listing.lng } : null;

  // --- Projection -------------------------------------------------------
  // Equirectangular lat/lng → x/y. x grows with longitude (east → right).
  // y is FLIPPED, because screen-y grows downward while latitude grows north.
  // Longitude is scaled by cos(centerLat) so one degree east covers the same
  // on-screen distance as one degree north at this latitude (no E-W stretch).
  const lats = map.pins.map((p) => p.lat).concat(star ? [star.lat] : []);
  const lngs = map.pins.map((p) => p.lng).concat(star ? [star.lng] : []);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const cosLat = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);

  const PAD = 30; // px padding baked into the projection
  const DRAW_W = 360; // target inner drawing width in viewBox units
  const geoW = Math.max((maxLng - minLng) * cosLat, 1e-9);
  const scale = DRAW_W / geoW;
  const project = (lat, lng) => [
    PAD + (lng - minLng) * cosLat * scale,
    PAD + (maxLat - lat) * scale, // flip y
  ];

  // --- Nodes + de-clustering -------------------------------------------
  const R = 13; // pin radius
  const nodes = map.pins.map((p) => {
    const [x, y] = project(p.lat, p.lng);
    return { x, y, r: R, pin: p };
  });
  let starNode = null;
  if (star) {
    const [x, y] = project(star.lat, star.lng);
    starNode = { x, y, r: 18, fixed: true };
  }

  // Push apart any markers closer than r+r+GAP so the tight downtown cluster
  // stays readable. The star is held fixed; numbered pins relax around it.
  const all = starNode ? nodes.concat([starNode]) : nodes;
  const GAP = 6;
  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + GAP;
        if (d === 0) { dx = 0.5; dy = 0.5; d = Math.hypot(dx, dy); }
        if (d < min) {
          const ux = dx / d, uy = dy / d, push = min - d;
          if (a.fixed) { b.x += ux * push; b.y += uy * push; }
          else if (b.fixed) { a.x -= ux * push; a.y -= uy * push; }
          else { a.x -= (ux * push) / 2; a.y -= (uy * push) / 2; b.x += (ux * push) / 2; b.y += (uy * push) / 2; }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  // --- viewBox (leave room under the star for its label) ----------------
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of all) {
    minX = Math.min(minX, n.x - n.r); maxX = Math.max(maxX, n.x + n.r);
    minY = Math.min(minY, n.y - n.r); maxY = Math.max(maxY, n.y + n.r);
  }
  if (starNode) maxY = Math.max(maxY, starNode.y + starNode.r + 18);
  const M = 12;
  const vbX = (minX - M).toFixed(1), vbY = (minY - M).toFixed(1);
  const vbW = (maxX - minX + 2 * M).toFixed(1), vbH = (maxY - minY + 2 * M).toFixed(1);

  // --- Render -----------------------------------------------------------
  let s = `<svg viewBox="${vbX} ${vbY} ${vbW} ${vbH}" role="img" aria-label="Map of featured El Segundo spots" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" rx="14" fill="#f0e9da" stroke="#e0d6c4" stroke-width="1"/>`;

  for (const n of nodes) {
    const p = n.pin;
    s += `<g>`;
    s += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r}" fill="${p.color}" stroke="#ffffff" stroke-width="1.6"/>`;
    s += `<text x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="600" fill="${p.textColor}">${p.n}</text>`;
    s += `</g>`;
  }

  if (starNode) {
    const sx = starNode.x, sy = starNode.y;
    s += `<g>`;
    s += `<polygon points="${starPolygon(sx, sy, 17, 7.5)}" fill="#2f8f8a" stroke="#ffffff" stroke-width="1.6"/>`;
    s += `<text x="${sx.toFixed(1)}" y="${(sy + starNode.r + 12).toFixed(1)}" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="700" fill="#13354e" stroke="#f0e9da" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">Open House</text>`;
    s += `</g>`;
  }

  s += `</svg>`;
  return s;
}

function main() {
  // Fresh output every build.
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Compile the template.
  const templateSrc = fs.readFileSync(path.join(TEMPLATE_DIR, "guide.html"), "utf8");
  const template = Handlebars.compile(templateSrc);

  // 1) Shared assets: stylesheet + everything under /assets (your headshot, etc.)
  fs.mkdirSync(path.join(DIST_DIR, "assets"), { recursive: true });
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, "styles.css"),
    path.join(DIST_DIR, "assets", "styles.css")
  );
  if (fs.existsSync(ASSETS_DIR)) {
    fs.cpSync(ASSETS_DIR, path.join(DIST_DIR, "assets"), { recursive: true });
  }

  // 2) Build a page for every guide.
  const slugs = fs
    .readdirSync(GUIDES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const built = [];

  for (const slug of slugs) {
    const guideDir = path.join(GUIDES_DIR, slug);
    const listingPath = path.join(guideDir, "listing.json");
    if (!fs.existsSync(listingPath)) {
      console.warn(`  ⚠ skipping ${slug}: no listing.json`);
      continue;
    }

    const listing = readJSON(listingPath);

    // Load the reusable neighborhood content this listing points to.
    const neighborhoodPath = path.join(NEIGHBORHOODS_DIR, `${listing.neighborhood}.json`);
    if (!fs.existsSync(neighborhoodPath)) {
      console.error(
        `  ✗ ${slug}: neighborhood "${listing.neighborhood}" not found at ${path.relative(ROOT, neighborhoodPath)}`
      );
      process.exitCode = 1;
      continue;
    }
    const neighborhood = readJSON(neighborhoodPath);

    // Resolve neighborhood photo bands. Shared per-city photos live in
    // assets/neighborhoods/<slug>/. For each entry we only keep it (with a web
    // `src`) when its file actually exists on disk — so a missing photo simply
    // skips its band in the template instead of showing a broken image.
    neighborhood.photos = resolveNeighborhoodPhotos(neighborhood.photos, listing.neighborhood);

    // Generate the inline SVG map (also tags each pin with its legend colors).
    const mapSvg = buildMapSvg(neighborhood, listing);

    // Merge: listing fields at the top level, neighborhood under `neighborhood`.
    const context = { ...listing, neighborhood, mapSvg };

    // Render + write the page.
    const html = template(context);
    const outDir = path.join(DIST_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);

    // Copy this listing's photos alongside the page.
    const photosDir = path.join(guideDir, "photos");
    if (fs.existsSync(photosDir)) {
      fs.cpSync(photosDir, path.join(outDir, "photos"), { recursive: true });
    }

    built.push({ slug, address: listing.address, city: neighborhood.city });
    console.log(`  ✓ built dist/${slug}/index.html  (${listing.address}, ${neighborhood.city})`);
  }

  // 3) Optional private index of every guide (handy for you, not linked publicly).
  writeIndex(built);

  console.log(`\nDone — ${built.length} guide${built.length === 1 ? "" : "s"} written to dist/.`);
}

function writeIndex(built) {
  const items = built
    .map(
      (g) =>
        `      <li><a href="/${g.slug}/">${g.address}</a> <span>${g.city}</span></li>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Beach City Brokers · Guides</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  body{font-family:'Inter',system-ui,sans-serif;background:#f7f2e9;color:#23303a;margin:0;padding:48px 22px;line-height:1.6}
  .box{max-width:560px;margin:0 auto}
  h1{font-family:'Fraunces',serif;color:#13354e;font-size:28px;margin:0 0 4px}
  p.sub{color:#5f6f79;font-size:14px;margin:0 0 24px}
  ul{list-style:none;padding:0;margin:0}
  li{background:#fff;border:1px solid #e0d6c4;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
  li a{color:#236f6b;font-weight:600;text-decoration:none}
  li span{color:#9aa6ae;font-size:12px}
</style>
</head>
<body>
  <div class="box">
    <h1>Neighborhood Guides</h1>
    <p class="sub">Private index — Beach City Brokers open-house guides.</p>
    <ul>
${items || "      <li><span>No guides yet.</span></li>"}
    </ul>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), html);
  console.log("  ✓ built dist/index.html  (private guide index)");
}

main();
