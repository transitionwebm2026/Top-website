'use client';

import { useEffect, useState } from 'react';
import { whenIdle } from '@/lib/idle';

/**
 * Pages are static HTML generated at build time. Once a page has loaded, its
 * content is fetched again from Supabase, so dashboard edits (and blog posts
 * reaching their publish date) show without rebuilding the site.
 *
 * Kept off the critical path:
 * - lib/cms/content.js, and with it the Supabase client, is only downloaded
 *   for the first refresh, once the browser is idle — it is in no page's
 *   initial JavaScript.
 * - Results are shared across pages for MAX_AGE: moving between pages renders
 *   the latest content straight away instead of querying Supabase again.
 */

const MAX_AGE = 60_000;
const recent = new Map(); // source id → { at, promise } of requests made in the last MAX_AGE
const latest = new Map(); // source id → last value received

const loadContent = () => import('./content');

function request({ id, load }) {
  const hit = recent.get(id);
  if (hit && Date.now() - hit.at < MAX_AGE) return hit.promise;
  const promise = loadContent()
    .then(load)
    .then((value) => {
      latest.set(id, value);
      return value;
    });
  // A failed request is retried by the next page instead of being cached.
  promise.catch(() => recent.get(id)?.promise === promise && recent.delete(id));
  recent.set(id, { at: Date.now(), promise });
  return promise;
}

const pickFrom = (source, value) => (source.select ? source.select(value) : value);

/**
 * `initial` is the build-time data; `sources` maps some of its keys to
 * `live.*` sources below. A key whose request fails keeps its current value,
 * and unchanged content keeps its identity, so nothing re-renders for nothing.
 * (Nothing is fetched before hydration, so the first render always matches the HTML.)
 */
export function useLiveContent(initial, sources) {
  const [data, setData] = useState(() => {
    let next = initial;
    for (const [key, source] of Object.entries(sources)) {
      if (latest.has(source.id)) next = { ...next, [key]: pickFrom(source, latest.get(source.id)) };
    }
    return next;
  });

  useEffect(() => {
    let alive = true;
    const keys = Object.keys(sources);
    const cancel = whenIdle(() => {
      Promise.allSettled(keys.map((key) => request(sources[key]).then((v) => pickFrom(sources[key], v)))).then((results) => {
        if (!alive) return;
        setData((current) => {
          let next = current;
          results.forEach((r, i) => {
            const key = keys[i];
            if (r.status === 'rejected') console.warn(`[cms] live ${key} failed:`, r.reason?.message);
            else if (JSON.stringify(r.value) !== JSON.stringify(current[key])) next = { ...next, [key]: r.value };
          });
          return next;
        });
      });
    });
    return () => {
      alive = false;
      cancel();
    };
    // Once per page view: `sources` is a new object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

/** Live sources: `id` names the request (shared by every page), `load` runs it with lib/cms/content.js. */
const source = (id, load, select) => ({ id, load, select });

export const live = {
  settings: source('settings', (c) => c.fetchSettings()),
  dictionary: source('dictionary', (c) => c.fetchDictionary()),
  page: (slug) => source(`page:${slug}`, (c) => c.fetchPage(slug)),
  blogs: source('blogs', (c) => c.fetchBlogs()),
  catalogs: source('catalogs', (c) => c.fetchCatalogs()),
  documents: source('documents', (c) => c.fetchDocuments()),
  partners: source('partners', (c) => c.fetchPartners()),
  projects: source('projects', (c) => c.fetchProjects()),
  /**
   * Catalog limited to the categories `built` has pages for: a category added
   * after the build has no page to link to until the next build.
   */
  catalog(built) {
    const ids = new Set(built.map((c) => c.id));
    return source('catalog', (c) => c.fetchCatalog(), (rows) => rows.filter((c) => ids.has(c.id)));
  },
};
