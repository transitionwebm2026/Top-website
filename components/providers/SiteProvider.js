'use client';

import { createContext, useContext, useMemo } from 'react';

const SiteContext = createContext(null);

/** Global settings from `site_settings` (contact numbers, socials, nav, branding). */
export function SiteProvider({ settings, children }) {
  const value = useMemo(() => {
    const telHref = (n = settings.callNumber) => `tel:${String(n || '').replace(/\s+/g, '')}`;
    const waHref = (text = '') =>
      `https://wa.me/${settings.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    return { ...settings, telHref, waHref };
  }, [settings]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
