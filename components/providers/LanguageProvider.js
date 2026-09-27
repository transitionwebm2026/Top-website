'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { dict } from '@/lib/i18n';

const LanguageContext = createContext(null);
const COOKIE = 'tp-lang';

/**
 * The language lives in a cookie so the server renders the right language,
 * direction and page title on the very first paint (no Arabic → English flash).
 */
export function LanguageProvider({ initialLang = 'ar', children }) {
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

  const value = useMemo(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      isRTL: lang === 'ar',
      t: dict[lang],
      // Pick the current-language value from a { ar, en } object.
      pick: (v) => (v && typeof v === 'object' && 'ar' in v ? v[lang] : v),
      setLang,
      toggle,
    }),
    [lang, setLang, toggle],
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
