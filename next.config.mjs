/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static site: `npm run build` writes plain HTML/CSS/JS to `out/` for any web host (Hostinger
  // public_html). Content is read from Supabase at build time and refreshed in the browser.
  output: 'export',
  // Every route becomes a folder with an index.html (/about/ → about/index.html), which Apache
  // serves without rewrite rules (see public/.htaccess).
  trailingSlash: true,
  // No image server on static hosting: <Image> picks a responsive WebP copy made at build time
  // (scripts/optimize-images.mjs) and serves Supabase uploads as they are.
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    // Keep in step with WIDTHS in scripts/optimize-images.mjs.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  // Allows a second server (e.g. QA) to build into its own folder without clobbering `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
