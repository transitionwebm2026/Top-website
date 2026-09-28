'use client';

import { cx } from './ui';

const LANG_COOKIE = 'tp-lang';

/** Persist the language in the cookie shared with the public site and flip the document direction. */
export function applyLang(lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

/** EN / ع switch for the dashboard (also sets the live site's language). */
export default function LangSwitch({ lang, onChange, label }) {
  return (
    <div className="flex rounded-xl border border-gold/20 bg-white/[0.03] p-0.5 text-xs font-bold" role="group" aria-label={label} dir="ltr">
      {[
        ['en', 'EN', 'English'],
        ['ar', 'ع', 'العربية'],
      ].map(([l, text, title]) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          title={title}
          aria-pressed={lang === l}
          className={cx('rounded-lg px-2.5 py-1.5 transition', lang === l ? 'bg-gold text-emerald-ink' : 'text-white/55 hover:text-white')}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
