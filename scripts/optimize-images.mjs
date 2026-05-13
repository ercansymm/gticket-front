// One-shot image optimizer for public/ assets that are actually referenced in code.
// Strategy:
//   - Convert PNG/JPEG sources to WebP (better compression, supported by all modern browsers).
//   - Resize huge images down to a sane max width (1920px is plenty for full-bleed hero/banner).
//   - Keep the original file extensions for in-place JPEGs (re-encode at q=78, progressive).
//   - For PNG/JPEG sources we ALSO emit a .webp sibling so callers can switch when convenient.
// Run:   node scripts/optimize-images.mjs

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "public");

/** @type {Array<{src: string, maxWidth?: number, jpegQuality?: number, webpQuality?: number, alsoWebp?: boolean}>} */
const TARGETS = [
  // Used by FlightSearchLoading.tsx
  { src: "ethiopia-search/ethiopiasearch2.png", maxWidth: 1600, alsoWebp: true },
  { src: "ethiopia-search/ethiopiasearch3.png", maxWidth: 1600, alsoWebp: true },
  { src: "ethiopia-search/ethiopiasearch4..jpeg", maxWidth: 1600, alsoWebp: true },
  { src: "ethiopia-search/ethiopiasearch5.jpg", maxWidth: 1600, alsoWebp: true },
  // Used by BreadCrumb.tsx
  { src: "assets/img/breadcrumb/breadcrumb.jpg", maxWidth: 1920, alsoWebp: true },
  // Used by biletbank.css
  { src: "assets/img/hero/backend/2.jpg", maxWidth: 1920, alsoWebp: true },
];

const DEFAULT_JPEG_Q = 78;
const DEFAULT_WEBP_Q = 75;

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

async function safeStat(p) {
  try { return await fs.stat(p); } catch { return null; }
}

async function processOne(t) {
  const abs = path.join(ROOT, t.src);
  const beforeStat = await safeStat(abs);
  if (!beforeStat) {
    console.log(`SKIP (missing): ${t.src}`);
    return null;
  }
  const ext = path.extname(abs).toLowerCase();
  const before = beforeStat.size;

  const meta = await sharp(abs).metadata();
  const resize = t.maxWidth && meta.width && meta.width > t.maxWidth
    ? { width: t.maxWidth, withoutEnlargement: true }
    : null;

  // 1) Re-encode original in place
  const buf = await fs.readFile(abs);
  let pipeline = sharp(buf, { failOn: "none" });
  if (resize) pipeline = pipeline.resize(resize);

  let outBuf;
  if (ext === ".png") {
    // Keep PNG path as PNG (lossless palette-quantized), but the .webp alongside is what we recommend using.
    outBuf = await pipeline.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  } else if (ext === ".jpg" || ext === ".jpeg") {
    outBuf = await pipeline.jpeg({ quality: t.jpegQuality ?? DEFAULT_JPEG_Q, progressive: true, mozjpeg: true }).toBuffer();
  } else {
    console.log(`SKIP (unsupported ext): ${t.src}`);
    return null;
  }
  await fs.writeFile(abs, outBuf);

  // 2) Emit .webp sibling
  let webpInfo = null;
  if (t.alsoWebp) {
    const webpPath = abs.replace(/\.(png|jpe?g)$/i, ".webp");
    let wp = sharp(buf, { failOn: "none" });
    if (resize) wp = wp.resize(resize);
    const webpBuf = await wp.webp({ quality: t.webpQuality ?? DEFAULT_WEBP_Q, effort: 5 }).toBuffer();
    await fs.writeFile(webpPath, webpBuf);
    webpInfo = { path: path.relative(ROOT, webpPath).replace(/\\/g, "/"), size: webpBuf.length };
  }

  return {
    src: t.src,
    before,
    after: outBuf.length,
    webp: webpInfo,
    width: meta.width,
    resizedTo: resize ? resize.width : null,
  };
}

async function main() {
  const rows = [];
  let totalBefore = 0, totalAfter = 0, totalWebp = 0;
  for (const t of TARGETS) {
    try {
      const r = await processOne(t);
      if (!r) continue;
      rows.push(r);
      totalBefore += r.before;
      totalAfter += r.after;
      if (r.webp) totalWebp += r.webp.size;
    } catch (e) {
      console.error(`ERROR ${t.src}:`, e.message);
    }
  }

  console.log("\n=== Optimization Report ===");
  for (const r of rows) {
    const pct = (100 * (1 - r.after / r.before)).toFixed(1);
    console.log(
      `${r.src}\n` +
      `   original ${fmt(r.before)} (${r.width}px)  ->  re-encoded ${fmt(r.after)}  (-${pct}%)` +
      (r.resizedTo ? `  [resized to ${r.resizedTo}px]` : "") +
      (r.webp ? `\n   webp:    ${r.webp.path}  ${fmt(r.webp.size)}` : "")
    );
  }
  console.log("---------------------------");
  console.log(`Total original:   ${fmt(totalBefore)}`);
  console.log(`Total re-encoded: ${fmt(totalAfter)}  (saved ${fmt(totalBefore - totalAfter)})`);
  if (totalWebp) console.log(`Total .webp:      ${fmt(totalWebp)}  (vs original: -${(100*(1-totalWebp/totalBefore)).toFixed(1)}%)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
