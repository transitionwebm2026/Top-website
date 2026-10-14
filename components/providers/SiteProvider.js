'use client';

import { createContext, useContext, useMemo } from 'react';
import { waNumber } from '@/lib/phone';
import { live, useLiveContent } from '@/lib/cms/live';
import ThemeStyle from './ThemeStyle';

const SiteContext = createContext(null);

/** Global settings from `site_settings` (contact numbers, socials, nav, branding), refreshed once the page loads. */
export function SiteProvider({ settings: built, children }) {
  const { settings: current } = useLiveContent({ settings: built }, { settings: live.settings });

  const value = useMemo(() => {
    // A share link only resolves at build time (lib/cms/content.js): keep the built map then.
    const settings = { ...current, mapEmbedUrl: current.mapEmbedUrl ?? built.mapEmbedUrl };
    const telHref = (n = settings.callNumber) => `tel:${String(n || '').replace(/\s+/g, '')}`;
    const waHref = (text = '') =>
      `https://wa.me/${waNumber(settings.whatsapp)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    return { ...settings, telHref, waHref };
  }, [current, built]);

  return (
    <SiteContext.Provider value={value}>
      {/* Brand colours edited since the build (the built ones are in the root layout). */}
      {current !== built && <ThemeStyle theme={current.theme} />}
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
