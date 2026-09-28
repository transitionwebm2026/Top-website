// Builds the link-preview image (Open Graph / WhatsApp / Facebook / X):
// public/images/og-image.jpg, 1200×630, the full logo centred on a blurred
// extension of its own background so nothing gets cropped in previews.
//
//   node scripts/og-image.cjs

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 1200;
const H = 630;
const SRC = path.join(__dirname, '../public/images/logo-full.jpg');
const OUT = path.join(__dirname, '../public/images/og-image.jpg');

(async () => {
  // Background: the plain green strip at the logo's left edge (no gold), stretched,
  // blurred and slightly darkened so it reads as a continuation of the logo backdrop.
  const background = await sharp(SRC)
    .extract({ left: 0, top: 0, width: 150, height: 1024 })
    .resize(W, H, { fit: 'fill' })
    .blur(30)
    .modulate({ brightness: 0.85 })
    .toBuffer();

  // Foreground: the full logo, with its left/right edges feathered into the background.
  const feather = Buffer.from(`
    <svg width="${H}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/>
          <stop offset="0.14" stop-color="#fff" stop-opacity="1"/>
          <stop offset="0.86" stop-color="#fff" stop-opacity="1"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${H}" height="${H}" fill="url(#g)"/>
    </svg>`);
  const logo = await sharp(SRC)
    .resize(H, H)
    .ensureAlpha()
    .composite([{ input: feather, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: logo, left: Math.round((W - H) / 2), top: 0 }])
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(OUT);

  const meta = await sharp(OUT).metadata();
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${meta.width}×${meta.height}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
})();
