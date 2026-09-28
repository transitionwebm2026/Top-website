// Central contact & social configuration.
// TODO: replace the placeholder phone numbers, email and social URLs with the real ones.
export const site = {
  name: { ar: 'توب باور', en: 'TOP POWER' },
  legalName: {
    ar: 'الهندسية للتوريدات الكهربائية والمقاولات توب باور',
    en: 'Top Power Engineering Supplies & Contracting',
  },
  tagline: { ar: 'مستلزمات هندسية MEP', en: 'MEP Engineering Supplies' },
  phones: ['+201000000000', '+201100000000'],
  whatsapp: '201000000000', // international format, digits only
  email: 'info@example.com',
  address: {
    ar: 'القاهرة - الأزبكية - 23 شارع عماد الدين',
    en: '23 Emad El-Din St., Azbakeya, Cairo, Egypt',
  },
  mapQuery: '23 Emad El-Din Street, Azbakeya, Cairo, Egypt',
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
  },
  registrations: {
    importers: '700020654',
    taxCard: '4648446200886003',
  },
};

export const telHref = (n = site.phones[0]) => `tel:${n}`;
export const waHref = (text = '') =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
