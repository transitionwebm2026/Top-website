'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileCheck2, Mail, MapPin, Phone } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';
import Logo from '@/components/ui/Logo';
import { useSocials } from './Navbar';

export default function Footer() {
  const { t, pick } = useLang();
  const site = useSite();
  const socials = useSocials();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-gold/20 bg-gradient-to-b from-emerald-night/60 to-emerald-ink backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-5">
          <Logo size={52} />
          <p className="max-w-sm leading-relaxed text-white/60">{t.footer.about}</p>
          <div className="flex gap-2">
            {socials.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="glass grid h-10 w-10 place-items-center rounded-full text-gold-light transition hover:-translate-y-1 hover:border-gold hover:text-gold"
              >
                <Icon width={17} height={17} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-gold">{t.footer.quick}</h3>
          <ul className="flex flex-col gap-3">
            {site.footerLinks.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-white/65 transition hover:text-gold-light hover:ps-1">
                  {pick(n.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-gold">{t.footer.reach}</h3>
          <ul className="flex flex-col gap-4 text-white/65">
            {pick(site.address) && (
              <li className="flex gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-gold" />
                {pick(site.address)}
              </li>
            )}
            {site.phones.map((p) => (
              <li key={p} className="flex gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-gold" />
                <a href={site.telHref(p)} dir="ltr" className="hover:text-gold-light">
                  {p}
                </a>
              </li>
            ))}
            {site.email && (
              <li className="flex gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${site.email}`} className="hover:text-gold-light">
                  {site.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-bold text-gold">{t.footer.registry}</h3>
          <div className="glass flex flex-col gap-3 rounded-2xl p-5 text-sm">
            <p className="font-semibold text-white/85">{pick(site.legalName)}</p>
            {site.registrations.importers && (
              <div className="flex items-center justify-between gap-3 border-t border-gold/15 pt-3 text-white/60">
                <span className="flex items-center gap-2">
                  <FileCheck2 size={15} className="text-gold" />
                  {t.footer.importers}
                </span>
                <span dir="ltr" className="font-[family-name:var(--font-montserrat)] font-semibold text-gold-light">
                  {site.registrations.importers}
                </span>
              </div>
            )}
            {site.registrations.taxCard && (
              <div className="flex items-center justify-between gap-3 text-white/60">
                <span className="flex items-center gap-2">
                  <FileCheck2 size={15} className="text-gold" />
                  {t.footer.taxCard}
                </span>
                <span dir="ltr" className="font-[family-name:var(--font-montserrat)] text-xs font-semibold text-gold-light">
                  {site.registrations.taxCard}
                </span>
              </div>
            )}
            {site.registrations.vat && (
              <div className="flex items-center gap-2 text-white/60">
                <FileCheck2 size={15} className="text-gold" />
                {t.footer.vat}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gold/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-white/45 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {site.logoText} — {t.footer.rights}
          </p>
          <p className="font-[family-name:var(--font-montserrat)] tracking-wider">{site.certificationsStrip}</p>
        </div>
      </div>

      {/* Agency credit — the agency's own signature, intentionally not editable in the CMS. */}
      <div className="flex justify-center px-4 pb-8">
        <div className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold/45 bg-gradient-to-l from-emerald-mid via-emerald-deep to-emerald-ink px-6 py-3 shadow-[0_10px_40px_-12px_rgba(205,176,116,0.45)] transition duration-500 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_14px_50px_-10px_rgba(205,176,116,0.7)] rtl:bg-gradient-to-r">
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          <span className="relative text-sm font-bold text-white/90">{t.footer.credit}</span>
          <Image src="/images/logo-01-mark.png" alt="" width={29} height={24} className="relative h-6 w-auto opacity-90" />
          <span className="text-gold-gradient relative font-[family-name:var(--font-montserrat)] text-base font-extrabold tracking-wide">
            Transition
          </span>
        </div>
      </div>
    </footer>
  );
}
