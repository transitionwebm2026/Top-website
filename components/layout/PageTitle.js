'use client';

import { useDocumentTitle, useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';

/**
 * Tab title in the visitor's language (the static HTML carries the Arabic one).
 * `title` is the page's { ar, en } title; empty → the site's default title.
 * Mirrors the title template in app/layout.js.
 */
export default function PageTitle({ title }) {
  const { lang, pick } = useLang();
  const site = useSite();
  const page = pick(title);
  useDocumentTitle(page ? `${page} | ${site.name[lang]}` : site.seo.title[lang] || site.name[lang]);
  return null;
}
