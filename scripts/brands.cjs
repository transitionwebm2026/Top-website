// One-off: crops partner logos from the "Our Brands" profile page (1024x1024).
const sharp = require('sharp');
const src = process.argv[2] + '/obj6.jpg';
const names = [['mech', 'claval', 'interpipe'], ['bothwell', 'potter', 'giacomini'], ['reliable', 'ttu', 'sa']];
const ys = [427, 640, 853], xs = [465, 668, 870];
(async () => {
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    await sharp(src).extract({ left: xs[c] - 70, top: ys[r] - 50, width: 140, height: 100 })
      .resize(280, 200).png().toFile(`public/images/brands/${names[r][c]}.png`);
})();
