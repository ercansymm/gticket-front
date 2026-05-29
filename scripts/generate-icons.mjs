// One-off icon generator: rasterizes the brand ATA mark into the asset files
// the Next.js metadata convention expects. Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" ry="96" fill="#0a1628"/>
  <text x="256" y="328" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="210" fill="#db2525" letter-spacing="-6">ATA</text>
</svg>`;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#071021"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="330" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="260" fill="#db2525" letter-spacing="-8">ATA</text>
  <text x="600" y="430" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="64" fill="#ffffff">atabilet.com</text>
  <text x="600" y="510" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="400" font-size="32" fill="#94a3b8">Ucuz Uçak Bileti — Karşılaştır, Satın Al</text>
</svg>`;

const iconBuf = Buffer.from(iconSvg);
const ogBuf = Buffer.from(ogSvg);

function out(p) {
  const full = resolve(root, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
}

// Build a minimal multi-size ICO (16, 32, 48) from PNG buffers
async function buildIco(sizes) {
  const pngs = await Promise.all(
    sizes.map((s) =>
      sharp(iconBuf).resize(s, s).png({ compressionLevel: 9 }).toBuffer()
    )
  );
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  const entries = [];
  const dataChunks = [];
  let offset = 6 + sizes.length * 16;
  sizes.forEach((s, i) => {
    const png = pngs[i];
    const e = Buffer.alloc(16);
    e.writeUInt8(s === 256 ? 0 : s, 0);
    e.writeUInt8(s === 256 ? 0 : s, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
    dataChunks.push(png);
  });
  return Buffer.concat([header, ...entries, ...dataChunks]);
}

const tasks = [
  { file: "src/app/apple-icon.png", buf: iconBuf, w: 180, h: 180, fmt: "png" },
  { file: "public/apple-icon.png", buf: iconBuf, w: 180, h: 180, fmt: "png" },
  { file: "public/favicon-32.png", buf: iconBuf, w: 32, h: 32, fmt: "png" },
  { file: "public/favicon.svg", svg: true },
  { file: "public/og-image.jpg", buf: ogBuf, w: 1200, h: 630, fmt: "jpeg" },
];

for (const t of tasks) {
  const dest = out(t.file);
  if (t.svg) {
    writeFileSync(dest, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" ry="96" fill="#0a1628"/>
  <text x="256" y="328" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="210" fill="#db2525" letter-spacing="-6">ATA</text>
</svg>
`);
    console.log("wrote", t.file);
    continue;
  }
  let pipe = sharp(t.buf).resize(t.w, t.h);
  pipe = t.fmt === "jpeg" ? pipe.jpeg({ quality: 88 }) : pipe.png({ compressionLevel: 9 });
  await pipe.toFile(dest);
  console.log("wrote", t.file);
}

// favicon.ico (multi-size) → both /src/app/ and /public/
const ico = await buildIco([16, 32, 48]);
for (const dest of ["src/app/favicon.ico", "public/favicon.ico"]) {
  writeFileSync(out(dest), ico);
  console.log("wrote", dest);
}

console.log("done.");
