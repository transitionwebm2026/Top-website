// Database rows → the view models the site components render.
//
// Every localized value becomes `{ ar, en }`, so components call `pick(value)`
// and switching language is instant (both languages are already loaded).

/** `{ ar, en }` from `<name>_ar` / `<name>_en`, each falling back to the other language. */
export function L(row, name) {
  const ar = row?.[`${name}_ar`];
  const en = row?.[`${name}_en`];
  return { ar: ar || en || '', en: en || ar || '' };
}

const list = (v) => (Array.isArray(v) ? v : []);
const bySort = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

const mapSpecs = (specs) => list(specs).map((s) => ({ k: L(s, 'label'), v: L(s, 'value') }));

// ------------------------------------------------------------------ settings
export function mapSettings(row) {
  if (!row) return null;
  const links = (v) =>
    list(v)
      .filter((l) => l.visible !== false && l.href)
      .map((l) => ({ href: l.href, label: L(l, 'label') }));
  return {
    name: L(row, 'site_name'),
    logoText: row.logo_text,
    tagline: L(row, 'tagline'),
    legalName: L(row, 'legal_name'),
    logo: row.logo_url,
    logoFull: row.logo_full_url,
    favicon: row.favicon_url,
    ogImage: row.og_image_url,
    phones: list(row.phones),
    callNumber: row.call_number || list(row.phones)[0] || '',
    whatsapp: row.whatsapp_number || '',
    whatsappGreeting: L(row, 'whatsapp_greeting'),
    email: row.email,
    address: L(row, 'address'),
    hours: L(row, 'working_hours'),
    mapEmbedUrl: row.map_embed_url,
    social: { facebook: row.facebook_url, instagram: row.instagram_url, tiktok: row.tiktok_url },
    nav: links(row.nav_links),
    footerLinks: links(row.footer_links),
    registrations: { importers: row.importers_number, taxCard: row.tax_card_number, vat: row.vat_registered },
    certificationsStrip: row.certifications_strip,
    theme: { primary: row.color_primary, secondary: row.color_secondary, accent: row.color_accent },
    seo: { siteUrl: row.site_url, title: L(row, 'meta_title'), description: L(row, 'meta_description') },
  };
}

// ------------------------------------------------------------------- catalog
export function mapProduct(row) {
  return {
    id: row.slug,
    icon: row.icon,
    name: L(row, 'name'),
    desc: L(row, 'description'),
    image: row.cover_image || null,
    gallery: list(row.gallery),
    sizes: list(row.sizes),
    pressure: L(row, 'pressure'),
    standard: row.standard || '',
    specs: mapSpecs(row.specs),
    shapes: list(row.shapes).filter((s) => s?.key),
    brands: list(row.brands).map((b) => ({
      name: L(b, 'name'),
      logo: b.logo || null,
      image: b.image || null,
      desc: L(b, 'desc'),
      datasheet: b.datasheet || null,
      primary: !!b.is_primary,
    })),
  };
}

export function mapCategory(row) {
  return {
    id: row.slug,
    icon: row.icon,
    image: row.cover_image || null,
    name: L(row, 'name'),
    short: L(row, 'short'),
    description: L(row, 'description'),
    brands: list(row.brands).map((b) => L(b, 'name')),
    certs: list(row.certs),
    standards: row.standards || '',
    sizes: L(row, 'sizes_label'),
    pressure: L(row, 'pressure_label'),
    specs: mapSpecs(row.specs),
    items: { ar: list(row.items_ar), en: list(row.items_en) },
    applications: { ar: list(row.applications_ar), en: list(row.applications_en) },
    brochure: list(row.brochure),
    showOnHome: row.show_on_home !== false,
    groups: list(row.products).sort(bySort).map(mapProduct),
  };
}

// --------------------------------------------------------------------- blogs
export function mapBlog(row) {
  return {
    id: row.slug,
    featured: row.display === 'hero',
    image: row.featured_image || null,
    date: row.published_at,
    readTime: row.read_time,
    category: L(row, 'category'),
    title: L(row, 'title'),
    excerpt: L(row, 'excerpt'),
    body: L(row, 'body'), // Markdown
  };
}

// ------------------------------------------------- documents / partners / projects
export const mapDocument = (row) => ({
  id: row.id,
  type: row.doc_type,
  image: row.image_url || null,
  file: row.file_url || null,
  title: L(row, 'title'),
  desc: L(row, 'description'),
});

export const mapPartner = (row) => ({ id: row.id, name: row.title_en || row.title_ar, logo: row.image_url, url: row.website_url });

export const mapProject = (row) => ({
  id: row.id,
  image: row.image_url || null,
  name: L(row, 'title'),
  place: L(row, 'location'),
  type: L(row, 'category'),
});

// --------------------------------------------------------------------- pages
/** Page row with nested sections → { meta, sections: { [key]: { ar, en } } }. */
export function mapPage(row) {
  if (!row) return { meta: null, sections: {} };
  const sections = {};
  list(row.sections)
    .sort(bySort)
    .forEach((s) => {
      // One-to-one relation: PostgREST returns an object (older versions: an array).
      const c = Array.isArray(s.section_content) ? s.section_content[0] : s.section_content;
      if (c) sections[s.key] = { ar: c.content_ar || {}, en: c.content_en || {} };
    });
  return {
    meta: {
      title: L(row, 'meta_title'),
      description: L(row, 'meta_description'),
      ogImage: row.og_image,
    },
    sections,
  };
}

// -------------------------------------------------------------- translations
/** Rows of { key: 'cta.contact', value_ar, value_en } → { ar: { cta: { contact } }, en: … }. */
export function buildDictionary(rows) {
  const dict = { ar: {}, en: {} };
  for (const row of list(rows)) {
    for (const lang of ['ar', 'en']) {
      const path = row.key.split('.');
      let node = dict[lang];
      path.slice(0, -1).forEach((p) => (node = node[p] ??= {}));
      node[path.at(-1)] = row[`value_${lang}`] || row[`value_${lang === 'ar' ? 'en' : 'ar'}`] || '';
    }
  }
  return dict;
}
