import { createPublicClient } from '@/lib/supabase/public';
import { isShortMapLink, resolveMapLink } from '@/lib/maps';
import {
  buildDictionary,
  mapBlog,
  mapCatalog,
  mapCategory,
  mapDocument,
  mapPage,
  mapPartner,
  mapProject,
  mapSettings,
} from './mappers';

/**
 * Public content loaders, shared by the build (lib/cms/queries.js, which adds
 * caching and fallbacks) and the browser (lib/cms/live.js, which refreshes the
 * static pages). They throw on failure; RLS limits them to published rows.
 */

async function run(query) {
  const { data, error } = await query;
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  return data;
}

const db = () => createPublicClient();

// --------------------------------------------------------------- global data
export async function fetchSettings() {
  const row = await run(db().from('site_settings').select('*').eq('id', 1).maybeSingle());
  if (!row) throw new Error('site_settings row is missing');
  // A share link saved as-is can't be framed. Only the build can resolve it (the
  // short-link host sends no CORS headers); in the browser it maps to null and
  // the build-time map is kept (SiteProvider).
  if (typeof window === 'undefined' && isShortMapLink(row.map_embed_url)) {
    row.map_embed_url = await resolveMapLink(row.map_embed_url).catch((err) => {
      console.error('[cms] map share link could not be resolved:', err.message);
      return null;
    });
  }
  return mapSettings(row);
}

export async function fetchDictionary() {
  return buildDictionary(await run(db().from('translations').select('key, value_ar, value_en')));
}

// --------------------------------------------------------------------- pages
const PAGE_SELECT = `
  slug, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en, og_image,
  sections ( key, type, sort_order, section_content ( content_ar, content_en ) )
`;

/** `{ meta, sections }` for a page slug: home · about_us · market · catalogs · blogs · contact_us. */
export async function fetchPage(slug) {
  return mapPage(await run(db().from('pages').select(PAGE_SELECT).eq('slug', slug).maybeSingle()));
}

// ------------------------------------------------------------------- catalog
export async function fetchCatalog() {
  const rows = await run(
    db()
      .from('product_categories')
      .select('*, products(*)')
      .order('sort_order')
      .order('sort_order', { referencedTable: 'products' }),
  );
  return rows.map(mapCategory);
}

// --------------------------------------------------------------------- blogs
export async function fetchBlogs() {
  const rows = await run(db().from('blogs').select('*').order('published_at', { ascending: false }));
  return rows.map(mapBlog);
}

// ------------------------------------------------------------ PDF catalogs
export async function fetchCatalogs() {
  const rows = await run(db().from('catalogs').select('*, line:product_categories(slug, name_ar, name_en)').order('sort_order').order('created_at'));
  return rows.map(mapCatalog);
}

// ------------------------------------------------- documents, partners, projects
export async function fetchDocuments() {
  return (await run(db().from('company_documents').select('*').order('sort_order'))).map(mapDocument);
}

const showcase = (kind) => run(db().from('partners_and_projects').select('*').eq('kind', kind).order('sort_order'));

export const fetchPartners = async () => (await showcase('partner')).map(mapPartner);
export const fetchProjects = async () => (await showcase('project')).map(mapProject);
