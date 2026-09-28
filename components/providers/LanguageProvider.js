'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';

const LanguageContext = createContext(null);
const COOKIE = 'tp-lang';

// Namespaces the components read from; guaranteed to exist so a missing
// translation renders empty instead of throwing.
const NAMESPACES = ['common', 'nav', 'cta', 'products', 'blog', 'contact', 'footer', 'shapes'];
function withNamespaces(d = {}) {
  const out = { ...d };
  NAMESPACES.forEach((ns) => (out[ns] ||= {}));
  return out;
}

/**
 * The language lives in a cookie so the server renders the right language,
 * direction and page title on the very first paint (no Arabic → English flash).
 *
 * `dictionary` is the UI text from the `translations` table for both languages
 * ({ ar: {...}, en: {...} }), so toggling language never waits on the network.
 */
export function LanguageProvider({ initialLang = 'ar', dictionary, children }) {
  const [lang, setLangState] = useState(initialLang);
  const router = useRouter();
  const first = useRef(true);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.cookie = `${COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    // Re-fetch server data (page <title>, metadata) in the new language.
    if (first.current) first.current = false;
    else router.refresh();
  }, [lang, router]);

  const setLang = useCallback((l) => setLangState(l === 'en' ? 'en' : 'ar'), []);
  const toggle = useCallback(() => setLangState((l) => (l === 'ar' ? 'en' : 'ar')), []);

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
