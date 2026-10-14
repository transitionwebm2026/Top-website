// Responsive WebP copies of every image in public/images, served by next/image
// through lib/image-loader.js. Runs before `npm run dev` and `npm run build`.
//
// public/images/brochure/sa.jpg (896px wide) → public/_img/brochure/sa-64.webp,
// -128, -256, -384, -640, -828 and -896 (its own width: nothing is upscaled).
// lib/image-manifest.json records each image's largest copy so the loader knows
// which copies exist. Unchanged images are skipped; copies of deleted images are removed.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/images';
const OUT = 'public/_img';
const MANIFEST = 'lib/image-manifest.json';
// Keep in step with images.deviceSizes / imageSizes in next.config.mjs.
const WIDTHS = [64, 128, 256, 384, 640, 828, 1200, 1920];
const QUALITY = 78;
const IMAGE = /\.(jpe?g|png|webp)$/i;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));
  return nested.flat();
}

const mtime = (file) => fs.stat(file).then((s) => s.mtimeMs, () => 0);
const toUrl = (file) => '/' + path.relative('public', file).split(path.sep).join('/');

const sources = (await walk(SRC)).filter((f) => IMAGE.test(f));
const images = {};
const expected = new Set();
let written = 0;

for (const file of sources) {
  const meta = await sharp(file).metadata();
  if (!meta.width) continue;
  // Largest copy: the original width, at most the widest size next/image asks for.
  const width = Math.min(meta.width, WIDTHS.at(-1));
  images[toUrl(file)] = width;

  const base = path.join(OUT, path.relative(SRC, file)).replace(IMAGE, '');
  if (expected.has(path.resolve(`${base}-${width}.webp`))) throw new Error(`[images] ${file} clashes with another file of the same name`);
  const srcTime = await mtime(file);
  for (const w of [...WIDTHS.filter((x) => x < width), width]) {
    const out = `${base}-${w}.webp`;
    expected.add(path.resolve(out));
    if ((await mtime(out)) >= srcTime) continue;
    await fs.mkdir(path.dirname(out), { recursive: true });
    await sharp(file).resize({ width: w }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    written++;
  }
}

// Copies of images that were renamed or deleted.
let removed = 0;
for (const file of await walk(OUT).catch(() => [])) {
  if (!expected.has(path.resolve(file))) {
    await fs.rm(file);
    removed++;
  }
}

const manifest = JSON.stringify({ widths: WIDTHS, images }, null, 2) + '\n';
if ((await fs.readFile(MANIFEST, 'utf8').catch(() => '')) !== manifest) await fs.writeFile(MANIFEST, manifest);

console.log(`[images] ${sources.length} images · ${written} copies written · ${removed} removed`);
