// One-off: brand-level pipe photos + category cover plates for the catalog.
const sharp = require('sharp');
const out = 'public/images/catalog/';
(async () => {
  await sharp('public/images/brochure/mech-pipe.jpg').extract({ left: 520, top: 590, width: 376, height: 240 }).jpeg({ quality: 90 }).toFile(out + 'pipe-mech.jpg');
  await sharp('public/images/brochure/interpipe.jpg').extract({ left: 520, top: 598, width: 376, height: 240 }).jpeg({ quality: 90 }).toFile(out + 'pipe-interpipe.jpg');
  await sharp('public/images/brochure/mech-pipe.jpg').extract({ left: 556, top: 240, width: 272, height: 272 }).jpeg({ quality: 90 }).toFile(out + 'pipe-marking.jpg');

  // Cover plates: items laid out evenly on a white 800x220 canvas.
  const plate = async (items, file) => {
    const W = 800, H = 220, slot = W / items.length;
    const layers = await Promise.all(
      items.map(async (src, i) => {
        const buf = await sharp(src).trim({ threshold: 18 }).resize({ width: Math.round(slot - 30), height: 180, fit: 'inside' }).toBuffer();
        const m = await sharp(buf).metadata();
        return { input: buf, left: Math.round(i * slot + (slot - m.width) / 2), top: Math.round((H - m.height) / 2) };
      }),
    );
    await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } }).composite(layers).jpeg({ quality: 90 }).toFile(out + file);
  };
  const I = 'public/images/items/';
  await plate([I + 'pipe.jpg'], 'cover-pipes.jpg');
  await plate([I + 'bw-elbow.jpg', I + 'mi-tee.jpg', I + 'grooved-elbow.jpg', I + 'forged-nipple.jpg'], 'cover-fittings.jpg');
  await plate([I + 'gate-valve.jpg', I + 'check-valve.jpg'], 'cover-valves.jpg');
  await plate([I + 'sprinkler-pendent.jpg', I + 'sprinkler-brass.jpg'], 'cover-sprinklers.jpg');
})();
