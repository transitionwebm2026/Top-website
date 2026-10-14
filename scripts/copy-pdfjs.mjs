// pdf.js for the catalog viewer (lib/pdf.js), copied from node_modules/pdfjs-dist
// to public/pdfjs/<version>/ and served as-is: the viewer imports it at runtime,
// so it never goes through the bundler. Runs before `npm run dev` and `npm run build`.
//
// - pdf.min.js + pdf.worker.min.js: the legacy build (also runs on older Safari /
//   Chrome), renamed from .mjs because Apache serves .mjs without a JavaScript type.
// - standard_fonts/, cmaps/, wasm/: fetched only by PDFs that need them (fonts
//   not embedded in the file, CJK text, JPEG 2000 / JBIG2 images).
// The version folder changes with every pdfjs-dist upgrade, so long browser
// caching never mixes versions; older folders are removed. public/pdfjs is git-ignored.

import fs from 'node:fs/promises';

const SRC = 'node_modules/pdfjs-dist';
const OUT = 'public/pdfjs';
const { version } = JSON.parse(await fs.readFile(`${SRC}/package.json`, 'utf8'));
const dest = `${OUT}/${version}`;

for (const entry of await fs.readdir(OUT).catch(() => [])) {
  if (entry !== version) await fs.rm(`${OUT}/${entry}`, { recursive: true, force: true });
}

const done = await fs.stat(`${dest}/pdf.worker.min.js`).then(() => true, () => false);
if (!done) {
  await fs.mkdir(dest, { recursive: true });
  for (const dir of ['standard_fonts', 'cmaps', 'wasm']) {
    // quickjs-eval runs scripts embedded in PDFs, which the viewer leaves off.
    await fs.cp(`${SRC}/${dir}`, `${dest}/${dir}`, { recursive: true, filter: (src) => !/quickjs/i.test(src) });
  }
  await fs.copyFile(`${SRC}/legacy/build/pdf.min.mjs`, `${dest}/pdf.min.js`);
  // Last, so an interrupted copy is redone next time.
  await fs.copyFile(`${SRC}/legacy/build/pdf.worker.min.mjs`, `${dest}/pdf.worker.min.js`);
}
console.log(`[pdfjs] ${done ? 'up to date' : 'copied'}: ${dest}`);
