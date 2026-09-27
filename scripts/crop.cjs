// One-off asset extraction: crops images from the company profile and screenshots.
const sharp = require('sharp');
const P = process.argv[2], IMG = process.argv[3], out = 'public/images/';
const c = (src, l, t, w, h, dst, q = 88) => sharp(src).extract({ left: l, top: t, width: w, height: h }).jpeg({ quality: q }).toFile(out + dst);
(async () => {
  const jobs = [
    [IMG + '/1.jpg', 225, 205, 575, 650, 'logo.jpg'],
    [IMG + '/1.jpg', 0, 0, 1024, 1024, 'logo-full.jpg'],
    [P + '/obj3.jpg', 100, 172, 412, 670, 'about-team.jpg'],
    [P + '/obj4.jpg', 0, 0, 848, 1264, 'cover.jpg'],
    // WhatsApp category plates
    [IMG + '/2.jpg', 22, 114, 696, 172, 'products/cat-piping.jpg'],
    [IMG + '/2.jpg', 22, 409, 696, 172, 'products/cat-flanges.jpg'],
    [IMG + '/2.jpg', 22, 704, 696, 172, 'products/cat-grooved.jpg'],
    [IMG + '/2.jpg', 22, 999, 696, 172, 'products/cat-malleable.jpg'],
    [IMG + '/2.jpg', 22, 1293, 696, 172, 'products/cat-sprinkler.jpg'],
    // documents
    [P + '/obj42.jpg', 55, 218, 322, 212, 'docs/tax-card.jpg', 92],
    [P + '/obj42.jpg', 872, 216, 318, 214, 'docs/vat.jpg', 92],
    [P + '/obj42.jpg', 52, 503, 410, 270, 'docs/importers.jpg', 92],
    [P + '/obj42.jpg', 790, 503, 407, 272, 'docs/commercial.jpg', 92],
    [P + '/obj42.jpg', 0, 0, 1233, 848, 'docs/all-documents.jpg', 90],
  ];
  const proj = [[140, 320], [390, 320], [266, 545], [516, 545], [140, 775], [390, 775], [266, 1000], [516, 1000]];
  proj.forEach(([x, y], i) => jobs.push([P + '/obj39.jpg', x - 72, y - 80, 144, 160, `projects/p${i + 1}.jpg`, 92]));
  const pages = { 9: 'mech-pipe', 12: 'interpipe', 15: 'mech-valves', 18: 'reliable', 21: 'ttu', 24: 'mech-malleable', 27: 'sa', 30: 'bothwell', 33: 'mech-grooved', 36: 'mech-sprinkler' };
  for (const [o, n] of Object.entries(pages)) jobs.push([P + `/obj${o}.jpg`, 0, 0, 0, 0, `brochure/${n}.jpg`]);
  for (const j of jobs) {
    if (!j[3]) await sharp(j[0]).jpeg({ quality: 85 }).toFile(out + j[5]);
    else await c(...j);
  }
  console.log('done', jobs.length);
})();
