import manifest from './image-manifest.json';

const STORAGE = '/storage/v1/object/public/';
const RESIZABLE = /\.(jpe?g|png|webp|avif)$/i;

/**
 * next/image loader for the static site (there is no image server of our own):
 * - Uploads in Supabase Storage go through Supabase's image transformations,
 *   resized to the requested width (never enlarged) and sent as WebP/AVIF to
 *   browsers that accept it.
 * - Images in public/images are served from the WebP copies made by
 *   scripts/optimize-images.mjs: the smallest copy at least as wide as asked
 *   for, never wider than the original.
 * - Anything else (SVGs, an image added without re-running the script) is served as-is.
 */
export default function imageLoader({ src, width }) {
  if (src.includes(STORAGE) && RESIZABLE.test(src.split('?')[0])) {
    const url = src.replace(STORAGE, '/storage/v1/render/image/public/');
    return `${url}${url.includes('?') ? '&' : '?'}width=${width}&resize=contain&quality=75`;
  }
  const largest = manifest.images[src];
  if (!largest) return src;
  const w = manifest.widths.find((x) => x >= width && x < largest) ?? largest;
  return `/_img${src.slice('/images'.length).replace(/\.\w+$/, '')}-${w}.webp`;
}
