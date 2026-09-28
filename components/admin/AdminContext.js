'use client';

import { createContext, useContext } from 'react';
import { LOCALES, tr, translate } from '@/lib/admin/i18n';

/** Language helpers for a given dashboard language. */
export function languageApi(lang) {
  return {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    locale: LOCALES[lang],
    t: (key, vars) => translate(lang, key, vars),
    tr: (value) => tr(value, lang),
  };
}

/**
 * Dashboard-wide state: the signed-in profile, the interface language (also
 * used for list previews and "View live site"), and the unread-enquiries counter.
 */
export const AdminContext = createContext({
  profile: null,
  ...languageApi('en'),
  setLang: () => {},
  newMessages: 0,
  refreshNewMessages: () => {},
});

export const useAdmin = () => useContext(AdminContext);
