'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/BrandIcons';
import Logo from '@/components/ui/Logo';

/** Social links from site settings; empty URLs are hidden. */
export function useSocials() {
  const { social } = useSite();
  return [
    { href: social.facebook, Icon: FacebookIcon, label: 'Facebook' },
    { href: social.instagram, Icon: InstagramIcon, label: 'Instagram' },
    { href: social.tiktok, Icon: TikTokIcon, label: 'TikTok' },
  ].filter((s) => s.href);
}

function LangToggle() {
  const { lang, toggle, t } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label={t.common.langLabel}
      className="glass relative flex h-9 w-[3.9rem] shrink-0 items-center rounded-full p-1 text-[0.7rem] font-bold sm:h-10 sm:w-[4.5rem] sm:text-xs"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-1 h-7 w-7 rounded-full bg-gradient-to-br from-gold-light to-gold-dark shadow-[0_0_14px_rgba(205,176,116,0.6)] sm:h-8 sm:w-8"
        style={{ insetInlineStart: 4 }}
      />
      <span className="relative z-10 grid w-7 place-items-center text-emerald-ink sm:w-8">{lang === 'ar' ? 'ع' : 'EN'}</span>
      <span className="relative z-10 grid w-7 place-items-center text-gold-light/80 sm:w-8">{t.common.langSwitch}</span>
    </button>
  );
}

function SocialIcons({ className = '' }) {
  const socials = useSocials();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socials.map(({ href, Icon, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          whileHover={{ y: -3, scale: 1.08 }}
          className="glass grid h-10 w-10 place-items-center rounded-full text-gold-light transition-colors hover:border-gold hover:text-gold hover:shadow-[0_0_18px_-2px_rgba(205,176,116,0.6)]"
        >
          <Icon width={17} height={17} />
        </motion.a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t, dir, pick } = useLang();
  const { nav: navItems, callNumber, telHref } = useSite();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-5 sm:pt-4"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full py-1.5 ps-2.5 pe-1.5 transition-all duration-500 sm:gap-4 sm:px-5 sm:py-2 ${
            scrolled ? 'glass-strong shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]' : 'glass'
          }`}
        >
          <Link href="/" aria-label="TOP POWER" className="min-w-0 lg:shrink-0">
            <Logo responsive />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative isolate block rounded-full px-4 py-2 text-[0.92rem] font-semibold transition-colors ${
                    isActive(item.href) ? 'text-emerald-ink' : 'text-white/80 hover:text-gold'
                  }`}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-light to-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {pick(item.label)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <SocialIcons className="hidden xl:flex" />
            <a
              href={telHref()}
              className="glass hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-gold-light transition hover:border-gold hover:text-gold md:flex"
            >
              <Phone size={16} />
              <span dir="ltr">{callNumber}</span>
            </a>
            <LangToggle />
            <button
              onClick={() => setOpen(true)}
              aria-label={t.common.menu}
              className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full text-gold sm:h-10 sm:w-10 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            dir={dir}
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-emerald-ink/70 backdrop-blur-lg" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              className="glass-strong absolute inset-y-0 start-0 flex w-[82%] max-w-sm flex-col gap-8 p-6"
            >
              <div className="flex items-center justify-between">
                <Logo size={40} />
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t.common.close}
                  className="glass grid h-10 w-10 place-items-center rounded-full text-gold"
                >
                  <X size={20} />
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      className={`block rounded-2xl px-5 py-4 text-lg font-bold transition ${
                        isActive(item.href) ? 'bg-gradient-to-br from-gold-light to-gold text-emerald-ink' : 'text-white/85 hover:bg-white/5'
                      }`}
                    >
                      {pick(item.label)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-4">
                <a href={telHref()} className="glass flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold text-gold-light">
                  <Phone size={18} />
                  <span dir="ltr">{callNumber}</span>
                </a>
                <SocialIcons className="justify-center" />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
