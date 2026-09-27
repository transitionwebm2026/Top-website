import { cookies } from 'next/headers';

export const LANG_COOKIE = 'tp-lang';

/** Current language on the server, from the cookie set by the language switcher. */
export async function getLang() {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === 'en' ? 'en' : 'ar';
}

/** Build page metadata in the visitor's language. */
export async function localizedMetadata({ ar, en }) {
  const lang = await getLang();
  return lang === 'en' ? en : ar;
}
