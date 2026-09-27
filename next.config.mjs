/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows a second server (e.g. QA) to build into its own folder without clobbering `next dev`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
