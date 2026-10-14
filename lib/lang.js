// Visitor language, shared by the site and the dashboard: Arabic by default,
// English when the `tp-lang` cookie says so. Pages are static HTML built in the
// default language; the saved choice is applied in the browser (useSavedLang in
// components/providers/LanguageProvider.js).

export const LANG_COOKIE = 'tp-lang';
export const DEFAULT_LANG = 'ar';

const SAVED_EN = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=en(?:;|$)`);

/** The saved language (browser only). */
export const savedLang = () => (SAVED_EN.test(document.cookie) ? 'en' : 'ar');

/** Remembers the language, points <html> at it and reveals a page hidden by LANG_SCRIPT. */
export function applyLang(lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === 'ar' ? 'rtl' : 'ltr';
  el.removeAttribute('data-lang-pending');
}

/**
 * Inline <head> script, run before the first paint. For English visitors it
 * sets the direction at once and hides the (Arabic) static HTML until the app
 * has switched language — `html[data-lang-pending]` in globals.css — with a
 * timeout so the page never stays hidden if scripts fail to load.
 */
export const LANG_SCRIPT = `(function(){try{if(${SAVED_EN}.test(document.cookie)){var d=document.documentElement;d.lang='en';d.dir='ltr';d.setAttribute('data-lang-pending','');setTimeout(function(){d.removeAttribute('data-lang-pending')},3000)}}catch(e){}})();`;
