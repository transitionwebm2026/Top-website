'use client';

import { LogOut, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useSavedLang } from '@/components/providers/LanguageProvider';
import { languageApi } from './AdminContext';
import { Button } from './ui';

/** Signed in, but the profile is not an admin (or the schema is not installed yet). */
export default function AccessDenied({ email, hasProfile }) {
  const [lang] = useSavedLang();
  const { t, dir } = languageApi(lang);
  // AdminGuard sends the signed-out user to the login page.
  const logout = () => createClient().auth.signOut();

  return (
    <main className="grid min-h-screen place-items-center px-4" dir={dir} lang={lang}>
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-500/15 text-red-300">
          <ShieldAlert size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-black text-white">{t('denied.title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {t('denied.body', { email })}
          {!hasProfile && ` ${t('denied.noProfile')}`}
        </p>
        <p className="mt-4 rounded-xl bg-black/30 p-3 text-start font-mono text-xs text-gold-light" dir="ltr">
          update public.profiles set role = &apos;admin&apos; where email = &apos;{email}&apos;;
        </p>
        <p className="mt-2 text-xs text-white/40">{t('denied.hint')}</p>
        <Button variant="secondary" icon={LogOut} onClick={logout} className="mt-6">
          {t('denied.signout')}
        </Button>
      </div>
    </main>
  );
}
