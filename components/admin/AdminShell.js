'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ExternalLink,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminContext, languageApi } from './AdminContext';
import { FeedbackProvider } from './feedback';
import LangSwitch, { applyLang } from './LangSwitch';
import { cx } from './ui';

export const NAV = [
  { href: '/admin', label: 'nav.overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/home', label: 'nav.home', icon: Home },
  { href: '/admin/about', label: 'nav.about', icon: Info },
  { href: '/admin/products', label: 'nav.products', icon: ShoppingBag },
  { href: '/admin/blogs', label: 'nav.blogs', icon: Newspaper },
  { href: '/admin/contact', label: 'nav.contact', icon: MessagesSquare, badge: 'messages' },
  { href: '/admin/settings', label: 'nav.settings', icon: Settings },
];

const COLLAPSE_KEY = 'tp-admin-sidebar';

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — preference just isn't remembered */
  }
}

export default function AdminShell({ profile, initialLang = 'ar', children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLangState] = useState(initialLang);
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => setCollapsed(readStorage(COLLAPSE_KEY) === '1'), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      writeStorage(COLLAPSE_KEY, c ? '0' : '1');
      return !c;
    });
  };

  // One language for the dashboard UI, list previews and "View live site".
  const setLang = useCallback(
    (l) => {
      setLangState(l);
      applyLang(l);
      router.refresh(); // server-rendered page titles follow the new language
    },
    [router],
  );

  const refreshNewMessages = useCallback(async () => {
    const { count } = await supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new');
    setNewMessages(count ?? 0);
  }, [supabase]);

  useEffect(() => {
    refreshNewMessages();
  }, [refreshNewMessages, pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const ctx = useMemo(
    () => ({ profile, ...languageApi(lang), setLang, newMessages, refreshNewMessages }),
    [profile, lang, setLang, newMessages, refreshNewMessages],
  );
  const { t, dir } = ctx;
  const rtl = dir === 'rtl';

  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const current = NAV.find(isActive);

  const navList = (compact) => (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item);
        const badge = item.badge === 'messages' ? newMessages : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={compact ? t(item.label) : undefined}
            className={cx(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              active ? 'text-emerald-ink' : 'text-white/65 hover:bg-white/[0.05] hover:text-gold-light',
              compact && 'justify-center px-0',
            )}
          >
            {active && (
              <motion.span
                layoutId={compact ? 'admin-nav-compact' : 'admin-nav'}
                className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-gold-light to-gold shadow-[0_8px_24px_-12px_rgba(205,176,116,0.9)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <item.icon size={18} className="shrink-0" />
            {!compact && <span className="truncate">{t(item.label)}</span>}
            {badge > 0 && (
              <span
                className={cx(
                  'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-black',
                  active ? 'bg-emerald-ink text-gold' : 'bg-gold text-emerald-ink',
                  compact ? 'absolute -top-1 -end-1' : 'ms-auto',
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (compact) => (
    <Link href="/admin" className={cx('flex items-center gap-3', compact && 'justify-center')}>
      <span className="hex-clip-v grid h-10 w-9 shrink-0 place-items-center bg-gradient-to-br from-gold-light to-gold-dark">
        <span className="font-[family-name:var(--font-montserrat)] text-xs font-black text-emerald-ink">TP</span>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="text-gold-gradient block font-[family-name:var(--font-montserrat)] text-base font-extrabold tracking-wide">TOP POWER</span>
          <span className={cx('block text-[0.65rem] font-semibold text-white/45', !rtl && 'tracking-[0.2em] uppercase')}>{t('shell.controlPanel')}</span>
        </span>
      )}
    </Link>
  );

  const initials = (profile?.full_name || profile?.email || '?')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <AdminContext.Provider value={ctx}>
      <FeedbackProvider>
        <div className="min-h-screen" dir={dir} lang={lang}>
          {/* Desktop sidebar */}
          <aside
            className={cx(
              'fixed inset-y-0 start-0 z-40 hidden flex-col border-e border-gold/15 bg-emerald-ink/80 p-4 backdrop-blur-2xl transition-[width] duration-300 lg:flex',
              collapsed ? 'w-20' : 'w-64',
            )}
          >
            <div className="mb-8 px-1 pt-1">{brand(collapsed)}</div>
            <div className="flex-1 overflow-y-auto">{navList(collapsed)}</div>
            <button
              onClick={toggleCollapsed}
              className={cx('mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 hover:bg-white/[0.05] hover:text-white', collapsed && 'justify-center')}
              aria-label={collapsed ? t('shell.expand') : t('shell.collapse')}
            >
              <CollapseIcon size={18} className="rtl:-scale-x-100" />
              {!collapsed && t('shell.collapse')}
            </button>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-emerald-ink/70 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
                <motion.aside
                  initial={{ x: rtl ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: rtl ? '100%' : '-100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                  className="absolute inset-y-0 start-0 flex w-72 flex-col border-e border-gold/20 bg-emerald-ink/95 p-4"
                >
                  <div className="mb-8 flex items-center justify-between">
                    {brand(false)}
                    <button onClick={() => setMobileOpen(false)} aria-label={t('shell.closeMenu')} className="grid h-9 w-9 place-items-center rounded-xl text-white/60 hover:bg-white/10">
                      <X size={18} />
                    </button>
                  </div>
                  {navList(false)}
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cx('transition-[padding] duration-300', collapsed ? 'lg:ps-20' : 'lg:ps-64')}>
            {/* Header bar */}
            <header className="sticky top-0 z-30 border-b border-gold/10 bg-emerald-ink/70 backdrop-blur-2xl">
              <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                <button onClick={() => setMobileOpen(true)} aria-label={t('shell.openMenu')} className="grid h-10 w-10 place-items-center rounded-xl text-gold hover:bg-white/5 lg:hidden">
                  <Menu size={20} />
                </button>
                <p className="hidden truncate text-sm font-semibold text-white/50 sm:block">{current && t(current.label)}</p>

                <div className="ms-auto flex items-center gap-2 sm:gap-3">
                  <LangSwitch lang={lang} onChange={setLang} label={t('shell.language')} />

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden items-center gap-2 rounded-xl border border-gold/25 px-3 py-2 text-xs font-bold text-gold-light transition hover:border-gold hover:bg-gold/10 sm:flex"
                  >
                    <ExternalLink size={14} /> {t('shell.viewSite')}
                  </a>

                  <div className="flex items-center gap-2.5 border-s border-white/10 ps-3">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-gold/40" />
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-mid to-emerald-deep font-[family-name:var(--font-montserrat)] text-xs font-black text-gold ring-2 ring-gold/40">
                        {initials}
                      </span>
                    )}
                    <div className="hidden leading-tight md:block">
                      <p className="max-w-[10rem] truncate text-sm font-semibold text-white/90">{profile?.full_name || profile?.email}</p>
                      <p className="text-[0.65rem] font-bold text-gold/80 ltr:tracking-wider ltr:uppercase">{profile?.role && t(`role.${profile.role}`)}</p>
                    </div>
                    <button
                      onClick={logout}
                      aria-label={t('shell.logout')}
                      title={t('shell.logout')}
                      className="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
                    >
                      <LogOut size={17} className="rtl:-scale-x-100" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </FeedbackProvider>
    </AdminContext.Provider>
  );
}
