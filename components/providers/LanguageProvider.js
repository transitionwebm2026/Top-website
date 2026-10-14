'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { DEFAULT_LANG, applyLang, savedLang } from '@/lib/lang';
import { live, useLiveContent } from '@/lib/cms/live';

const LanguageContext = createContext(null);

// Namespaces the components read from; guaranteed to exist so a missing
// translation renders empty instead of throwing.
const NAMESPACES = ['common', 'nav', 'cta', 'products', 'catalog', 'blog', 'contact', 'footer', 'shapes'];
function withNamespaces(d = {}) {
  const out = { ...d };
  NAMESPACES.forEach((ns) => (out[ns] ||= {}));
  return out;
}

/**
 * Language state for a static page (site and dashboard): starts in the default
 * language the HTML was built in, switches to the visitor's saved language
 * right after hydration, then keeps the `tp-lang` cookie and <html lang/dir> in sync.
 */
export function useSavedLang() {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setLang(savedLang());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) applyLang(lang);
  }, [lang, ready]);

  return [lang, setLang];
}

/**
 * Keeps the tab title at `title`. The static HTML carries the Arabic title and
 * Next.js re-applies it after client navigations, so changes to <head> are watched.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
}

/**
 * `dictionary` is the UI text from the `translations` table for both languages
 * ({ ar: {...}, en: {...} }), so toggling language never waits on the network.
 * It is built into the page and refreshed from Supabase once the page loads.
 */
export function LanguageProvider({ dictionary: built, children }) {
  const [lang, setLangState] = useSavedLang();
  const { dictionary } = useLiveContent({ dictionary: built }, { dictionary: live.dictionary });

  const setLang = useCallback((l) => setLangState(l === 'en' ? 'en' : 'ar'), [setLangState]);
  const toggle = useCallback(() => setLangState((l) => (l === 'ar' ? 'en' : 'ar')), [setLangState]);

  const dicts = useMemo(() => ({ ar: withNamespaces(dictionary?.ar), en: withNamespaces(dictionary?.en) }), [dictionary]);

  const value = useMemo(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      isRTL: lang === 'ar',
      t: dicts[lang],
      // Pick the current-language value from a { ar, en } object
      // (CMS fields, section content documents, mapped rows).
      pick: (v) => (v && typeof v === 'object' && 'ar' in v ? v[lang] : v),
      setLang,
      toggle,
    }),
    [lang, dicts, setLang, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
