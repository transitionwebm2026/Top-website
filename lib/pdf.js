import pdfjsPackage from 'pdfjs-dist/package.json';

/**
 * pdf.js for the catalog viewer and the dashboard's catalog editor.
 *
 * It runs as shipped from public/pdfjs/<version>/ (scripts/copy-pdfjs.mjs) and
 * is imported only when a PDF is opened: with its worker it is about 1.8 MB, so
 * it is in no page's initial JavaScript and never goes through the bundler.
 */
const BASE = `/pdfjs/${pdfjsPackage.version}/`;

let pdfjs = null;

/** Loads pdf.js (once); also used to fetch it ahead, e.g. when a catalog is hovered. */
export function loadPdfjs() {
  if (!pdfjs) {
    pdfjs = import(/* webpackIgnore: true */ `${BASE}pdf.min.js`).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `${BASE}pdf.worker.min.js`;
      return lib;
    });
    // Offline or blocked: let the next attempt try again.
    pdfjs.catch(() => (pdfjs = null));
  }
  return pdfjs;
}

/**
 * Starts loading a PDF and returns pdf.js's loading task: `await task.promise`
 * for the document, `task.destroy()` to cancel and free it.
 * `onProgress(fraction)` reports the download (null while the size is unknown).
 */
export async function openPdf(url, onProgress) {
  const lib = await loadPdfjs();
  const task = lib.getDocument({
    url,
    cMapUrl: `${BASE}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${BASE}standard_fonts/`,
    wasmUrl: `${BASE}wasm/`,
  });
  if (onProgress) task.onProgress = ({ loaded, total }) => onProgress(total ? Math.min(1, loaded / total) : null);
  return task;
}

/** Width ÷ height of a pdf.js page. */
export function pageAspect(page) {
  const { width, height } = page.getViewport({ scale: 1 });
  return width / height;
}

/**
 * Draws a page `width` device pixels wide and returns it as an image Blob.
 * `half: 'right'` keeps only the right half (the front cover of a two-page spread).
 */
export async function renderPage(page, width, { half, type = 'image/jpeg', quality = 0.9 } = {}) {
  const fullWidth = half ? width * 2 : width;
  const viewport = page.getViewport({ scale: fullWidth / page.getViewport({ scale: 1 }).width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(half ? viewport.width / 2 : viewport.width);
  canvas.height = Math.round(viewport.height);
  const transform = half === 'right' ? [1, 0, 0, 1, -viewport.width / 2, 0] : undefined;
  await page.render({ canvas, viewport, transform }).promise;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  canvas.width = canvas.height = 0; // frees the bitmap now (Safari keeps it otherwise)
  if (!blob) throw new Error('The page could not be drawn.');
  return blob;
}

/**
 * Page count, size in bytes and (with `cover`) a cover image: the first page,
 * or its right half when it is a two-page spread (front and back cover side by side).
 */
export async function inspectPdf(url, { cover = true } = {}) {
  const task = await openPdf(url);
  try {
    const doc = await task.promise;
    const { length } = await doc.getDownloadInfo();
    let image = null;
    if (cover) {
      const page = await doc.getPage(1);
      image = await renderPage(page, 900, { half: pageAspect(page) > 1.2 ? 'right' : null, quality: 0.86 });
    }
    return { pages: doc.numPages, bytes: length || null, cover: image };
  } finally {
    task.destroy();
  }
}
