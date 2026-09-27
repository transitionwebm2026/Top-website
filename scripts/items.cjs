// One-off: crops single-item images from the category plates and the MECH valves page.
const sharp = require('sharp');
const cats = {
  piping: { names: ['pipe', 'grooving-machine', 'hanger'], cuts: [0, 262, 478, 696] },
  flanges: { names: ['bw-elbow', 'forged-nipple', 'flange'], cuts: [0, 232, 464, 696] },
  grooved: { names: ['grooved-elbow', 'coupling', 'lubricant'], cuts: [0, 232, 464, 696] },
  malleable: { names: ['mi-elbow', 'mi-tee', 'ptfe-tape'], cuts: [0, 232, 464, 696] },
  sprinkler: { names: ['sprinkler-pendent', 'sprinkler-brass', 'sprinkler-bracket'], cuts: [0, 170, 312, 696] },
};
const white = (w, h) => ({ create: { width: w, height: h, channels: 3, background: '#ffffff' } });
(async () => {
  for (const [cat, { names, cuts }] of Object.entries(cats)) {
    const src = `public/images/products/cat-${cat}.jpg`; // 696x172
    for (let i = 0; i < 3; i++) {
      await sharp(src)
        .extract({ left: cuts[i], top: 0, width: cuts[i + 1] - cuts[i], height: 172 })
        .extend({ top: 30, bottom: 30, left: 20, right: 20, background: '#ffffff' })
        .jpeg({ quality: 90 })
        .toFile(`public/images/items/${names[i]}.jpg`);
    }
  }
  const v = 'public/images/brochure/mech-valves.jpg';
  await sharp(v).extract({ left: 700, top: 625, width: 152, height: 300 }).jpeg({ quality: 90 }).toFile('public/images/items/gate-valve.jpg');
  // Check valve: mask the neighbouring label box and leader line in the top-left corner.
  const cv = await sharp(v).extract({ left: 474, top: 688, width: 228, height: 238 }).toBuffer();
  await sharp(cv)
    .composite([{ input: await sharp(white(72, 100)).png().toBuffer(), left: 0, top: 0 }, { input: await sharp(white(100, 42)).png().toBuffer(), left: 128, top: 0 }])
    .jpeg({ quality: 90 })
    .toFile('public/images/items/check-valve.jpg');
})();
