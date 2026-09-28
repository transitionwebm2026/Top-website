import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getLang } from '@/lib/lang';
import { CMS_TAG } from './constants';
import { ogImage, socialMeta } from './seo';
import {
  buildDictionary,
  mapBlog,
  mapCategory,
  mapDocument,
  mapPage,
  mapPartner,
  mapProject,
  mapSettings,
} from './mappers';

/**
 * Server-side content fetchers for the public site.
 *
 * Results are cached across requests under the `cms` tag. Saving anything in
 * the dashboard calls `revalidateTag('cms')` (app/admin/actions.js), so edits
 * appear on the next page load; the time-based revalidate is only a safety net.
 *
 * Each fetcher returns a safe empty value if Supabase is unreachable or not
 * migrated yet, so a missing section hides itself instead of crashing a page.
 */
const REVALIDATE_SECONDS = 300;

const cache = (fn, key) => unstable_cache(fn, ['cms', key], { tags: [CMS_TAG], revalidate: REVALIDATE_SECONDS });

async function run(query) {
  const { data, error } = await query;
  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  return data;
}

/** Wraps a cached loader: errors are logged, not cached, and turned into `fallback`. */
function safe(label, loader, fallback) {
  return async (...args) => {
    if (!isSupabaseConfigured) return fallback;
    try {
      return await loader(...args);
    } catch (err) {
      console.error(`[cms] ${label} failed:`, err.code || '', err.message);
      return fallback;
    }
  };
}

const db = () => createPublicClient();

// --------------------------------------------------------------- global data
export const getSiteSettings = safe(
  'settings',
  cache(async () => mapSettings(await run(db().from('site_settings').select('*').eq('id', 1).maybeSingle())), 'settings'),
  null,
);

export const getDictionary = safe(
  'translations',
  cache(async () => buildDictionary(await run(db().from('translations').select('key, value_ar, value_en'))), 'dictionary'),
  { ar: {}, en: {} },
);

// --------------------------------------------------------------------- pages
const PAGE_SELECT = `
  slug, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en, og_image,
  sections ( key, type, sort_order, section_content ( content_ar, content_en ) )
`;

/** `{ meta, sections }` for a page slug: home · about_us · market · blogs · contact_us. */
export const getPage = safe(
  'page',
  cache(async (slug) => mapPage(await run(db().from('pages').select(PAGE_SELECT).eq('slug', slug).maybeSingle())), 'page'),
  { meta: null, sections: {} },
);

// ------------------------------------------------------------------- catalog
export const getCatalog = safe(
  'catalog',
  cache(async () => {
    const rows = await run(
      db()
        .from('product_categories')
        .select('*, products(*)')
        .order('sort_order')
        .order('sort_order', { referencedTable: 'products' }),
    );
    return rows.map(mapCategory);
  }, 'catalog'),
  [],
);

// --------------------------------------------------------------------- blogs
export const getBlogs = safe(
  'blogs',
  cache(async () => {
    const rows = await run(db().from('blogs').select('*').order('published_at', { ascending: false }));
    return rows.map(mapBlog);
  }, 'blogs'),
  [],
);

// ------------------------------------------------- documents, partners, projects
export const getDocuments = safe(
  'documents',
  cache(async () => (await run(db().from('company_documents').select('*').order('sort_order'))).map(mapDocument), 'documents'),
  [],
);

const partnersAndProjects = cache(
  async () => run(db().from('partners_and_projects').select('*').order('sort_order')),
  'partners_and_projects',
);

export const getPartners = safe('partners', async () => (await partnersAndProjects()).filter((r) => r.kind === 'partner').map(mapPartner), []);
export const getProjects = safe('projects', async () => (await partnersAndProjects()).filter((r) => r.kind === 'project').map(mapProject), []);

// ------------------------------------------------------------------ metadata
/**
 * Localized <head> metadata for a CMS page, including a complete link preview.
 * A page-level Open Graph block replaces the site-wide one, so it always carries
 * an image: the page's own share image, else the site's (the logo by default).
 */
export async function pageMetadata(slug) {
  const [lang, page, s] = await Promise.all([getLang(), getPage(slug), getSiteSettings()]);
  const meta = page.meta;
  const siteName = s?.name[lang];
  const title = meta?.title?.[lang];
  const description = meta?.description?.[lang];
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...socialMeta({
      title: title ? `${title} | ${siteName}` : s?.seo.title[lang] || siteName,
      description: description || s?.seo.description[lang],
      image: ogImage(meta?.ogImage || s?.ogImage, siteName),
      siteName,
      lang,
    }),
  };
}
