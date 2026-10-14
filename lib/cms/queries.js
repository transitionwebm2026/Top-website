import 'server-only';
import { cache } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { DEFAULT_LANG } from '@/lib/lang';
import { ogImage, socialMeta } from './seo';
import {
  fetchBlogs,
  fetchCatalog,
  fetchCatalogs,
  fetchDictionary,
  fetchDocuments,
  fetchPage,
  fetchPartners,
  fetchProjects,
  fetchSettings,
} from './content';

/**
 * Build-time content for the static pages (`npm run build`).
 *
 * Each loader is deduplicated per page render (layout, metadata and page share
 * one request) and returns a safe empty value if Supabase is unreachable or not
 * migrated yet, so a missing section hides itself instead of failing the build.
 * Failures are logged in the build output. In the browser, lib/cms/live.js
 * fetches the same content again, so dashboard edits show without a rebuild.
 */
function safe(label, loader, fallback) {
  const cached = cache(loader);
  return async (...args) => {
    if (!isSupabaseConfigured) return fallback;
    try {
      return await cached(...args);
    } catch (err) {
      console.error(`[cms] ${label} failed:`, err.code || '', err.message);
      return fallback;
    }
  };
}

export const getSiteSettings = safe('settings', fetchSettings, null);
export const getDictionary = safe('translations', fetchDictionary, { ar: {}, en: {} });
export const getPage = safe('page', fetchPage, { meta: null, sections: {} });
export const getCatalog = safe('catalog', fetchCatalog, []);
export const getBlogs = safe('blogs', fetchBlogs, []);
export const getCatalogs = safe('catalogs', fetchCatalogs, []);
export const getDocuments = safe('documents', fetchDocuments, []);
export const getPartners = safe('partners', fetchPartners, []);
export const getProjects = safe('projects', fetchProjects, []);

// ------------------------------------------------------------------ metadata
/**
 * <head> metadata for a CMS page, including a complete link preview, in the
 * default language (the static HTML is Arabic; PageTitle localizes the tab title).
 * A page-level Open Graph block replaces the site-wide one, so it always carries
 * an image: the page's own share image, else the site's (the logo by default).
 */
export async function pageMetadata(slug) {
  const lang = DEFAULT_LANG;
  const [page, s] = await Promise.all([getPage(slug), getSiteSettings()]);
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
