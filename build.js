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

    // Merge: listing fields at the top level, neighborhood under `neighborhood`.
    const context = { ...listing, neighborhood };

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
