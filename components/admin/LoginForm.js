'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminContext, languageApi } from './AdminContext';
import LangSwitch, { applyLang } from './LangSwitch';
import { ErrorNote, Label, cx, inputCls } from './ui';

/** Email + password sign-in with Supabase Auth. Accounts are created by an admin (no public sign-up). */
export default function LoginForm({ next = '/admin', configured = true, initialLang = 'ar' }) {
  const router = useRouter();
  const [lang, setLang] = useState(initialLang);
  const api = useMemo(() => languageApi(lang), [lang]);
  const { t, dir } = api;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const changeLang = (l) => {
    setLang(l);
    applyLang(l);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        setError(authError.message === 'Invalid login credentials' ? 'login.wrong' : authError.message);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ ...api, profile: null }}>
      <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12" dir={dir} lang={lang}>
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-emerald-mid/50 blur-[110px]" />
        <div className="grid-texture pointer-events-none absolute inset-0" />

        <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
          <LangSwitch lang={lang} onChange={changeLang} label={t('shell.language')} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="animated-border glass-strong relative w-full max-w-md rounded-[28px] p-8 sm:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <span className="hex-clip-v grid h-16 w-14 place-items-center bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-[0_0_40px_-6px_rgba(205,176,116,0.8)]">
              <Lock size={22} className="text-emerald-ink" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-white">
              <span className="text-gold-gradient font-[family-name:var(--font-montserrat)]">TOP POWER</span> {t('login.title')}
            </h1>
            <p className="mt-2 text-sm text-white/55">{t('login.subtitle')}</p>
          </div>

          {!configured ? (
            <div className="mt-8">
              <ErrorNote>{t('login.notConfigured')}</ErrorNote>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
              <div>
                <Label htmlFor="email">{t('login.email')}</Label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cx(inputCls, 'h-12 ps-10')}
                    placeholder="admin@company.com"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cx(inputCls, 'h-12 ps-10 pe-11')}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? t('login.hide') : t('login.show')}
                    className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/40 hover:text-white"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <ErrorNote>{error}</ErrorNote>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="group mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-gold-light via-gold to-gold-dark font-bold text-emerald-ink shadow-[0_12px_36px_-12px_rgba(205,176,116,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {t('login.submit')}
                    <ArrowRight size={17} className="transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-white/35">{t('login.restricted')}</p>
        </motion.div>
      </main>
    </AdminContext.Provider>
  );
}
