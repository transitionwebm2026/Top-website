// PDF catalogs on /catalog (files in public/catalogs, covers in public/images/catalogs).
export const catalogs = [
  {
    slug: 'mech-fire-sprinklers',
    title: { ar: 'كتالوج رشاشات الحريق MECH', en: 'MECH Fire Sprinkler Catalog' },
    desc: {
      ar: 'رشاشات K80 وK115 وK161 بأنواعها القائم والمتدلي والجانبي، بسرعات استجابة مختلفة، مع جداول الموديلات ودرجات حرارة التشغيل.',
      en: 'K80, K115 and K161 sprinklers in upright, pendant and sidewall types with quick, standard and special response — model tables and operating temperatures.',
    },
    category: { ar: 'رشاشات الحريق', en: 'Fire Sprinklers' },
    brand: 'MECH',
    line: 'sprinklers', // product_categories.slug
    file: '/catalogs/mech-fire-sprinklers.pdf',
    cover: '/images/catalogs/mech-fire-sprinklers.jpg',
    pages: 7,
    size: 2851699,
  },
  {
    slug: 'interpipe-pipes',
    title: { ar: 'كتالوج مواسير INTERPIPE', en: 'INTERPIPE Pipe Catalog' },
    desc: {
      ar: 'مواسير سيملس وفق ASTM A106 / A53: الأقطار وسماكات الجدار والأوزان حسب ANSI/ASME B36.10M.',
      en: 'Seamless pipes to ASTM A106 / A53: outside diameters, wall thicknesses and weights per ANSI/ASME B36.10M.',
    },
    category: { ar: 'المواسير', en: 'Pipes' },
    brand: 'INTERPIPE',
    line: 'pipes',
    file: '/catalogs/interpipe-pipes.pdf',
    cover: '/images/catalogs/interpipe-pipes.jpg',
    pages: 6,
    size: 480188,
  },
];
