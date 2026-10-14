'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, Download, FileText } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { FlipbookReader, formatSize, preloadReader as preload } from './reader';

/**
 * A closed book in 3D: the cover image, the page block along the fore-edge (thicker
 * for longer catalogs) and a back cover. On hover the book turns towards the
 * visitor and its cover opens a little. Always left-to-right, like the PDFs.
 */
function Book({ cover, title, pages }) {
  const depth = Math.round(Math.min(34, 16 + (pages || 0) * 0.6));
  return (
    <div dir="ltr" className="relative mx-auto aspect-[17/24] w-[68%] [perspective:1600px]" style={{ '--depth': `${depth}px` }}>
      <div className="absolute inset-x-[6%] -bottom-6 h-10 rounded-[50%] bg-black/60 blur-xl transition duration-700 group-hover:scale-x-90 group-hover:opacity-60" />
      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] [transform:rotateY(-26deg)] group-hover:[transform:rotateY(-12deg)_translateY(-10px)]">
        {/* Back cover */}
        <div className="absolute inset-0 rounded-[3px_8px_8px_3px] bg-emerald-night shadow-[24px_30px_50px_-12px_rgba(0,0,0,0.7)] [transform:translateZ(calc(var(--depth)*-1))]" />
        {/* Page block along the fore-edge */}
        <div className="absolute inset-y-[1.4%] left-[calc(100%-3px)] w-[var(--depth)] origin-left bg-[repeating-linear-gradient(90deg,#f6f3ec_0_2px,#ddd6c6_2px_3px)] [transform:rotateY(90deg)]" />
        {/* First page, seen when the cover opens */}
        <div className="absolute inset-y-[1.4%] right-[3px] left-0 rounded-r-[5px] bg-gradient-to-r from-[#e2dccd] via-[#f7f4ee] to-[#fdfcf9] [transform:translateZ(-1px)]" />
        {/* Cover */}
        <div className="absolute inset-0 origin-left overflow-hidden rounded-[3px_8px_8px_3px] bg-emerald-deep transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(-24deg)]">
          {cover ? (
            <Image src={cover} alt="" fill sizes="(min-width: 640px) 220px, 60vw" className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 border border-gold/40 bg-gradient-to-br from-emerald-mid via-emerald-deep to-emerald-ink p-6 text-center">
              <FileText size={44} strokeWidth={1.2} className="text-gold" />
              <span className="text-sm leading-snug font-bold text-gold-light">{title}</span>
            </div>
          )}
          {/* Spine crease and a soft gloss */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(255,255,255,0.22)_2.2%,rgba(0,0,0,0.14)_4.5%,transparent_9%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/25" />
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ catalog, onOpen }) {
  const { t, pick } = useLang();
  const tc = t.catalog;
  const title = pick(catalog.title);
  const stats = [
    catalog.pages && { label: tc.pages, value: catalog.pages },
    catalog.size && { label: tc.size, value: formatSize(catalog.size) },
    { label: tc.format, value: 'PDF' },
  ].filter(Boolean);

  return (
    <article className="group relative flex h-full flex-col" onPointerEnter={preload}>
      <button
        type="button"
        onClick={onOpen}
        onFocus={preload}
        aria-label={`${tc.browse}: ${title}`}
        className="relative z-10 block w-full cursor-pointer rounded-3xl pb-2 outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
      >
        <Book cover={catalog.cover} title={title} pages={catalog.pages} />
      </button>

      <GlassCard className="-mt-24 flex flex-1 flex-col items-center px-6 pt-32 pb-6 text-center">
        <div className="relative z-10 flex flex-wrap justify-center gap-2">
          {pick(catalog.category) && (
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold-light ring-1 ring-gold/30">{pick(catalog.category)}</span>
          )}
          {catalog.brand && (
            <span dir="ltr" className="rounded-full px-3 py-1 font-[family-name:var(--font-montserrat)] text-xs font-bold tracking-wider text-white/70 ring-1 ring-white/15">
              {catalog.brand}
            </span>
          )}
        </div>
        <h3 className="relative z-10 mt-4 text-xl leading-snug font-extrabold text-balance">{title}</h3>
        {pick(catalog.desc) && <p className="relative z-10 mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">{pick(catalog.desc)}</p>}
        {/* Keeps the stats and buttons of neighbouring cards on one line. */}
        <div className="min-h-5 flex-1" />

        <dl
          className="relative z-10 grid w-full divide-x divide-gold/15 rounded-2xl border border-gold/15 bg-white/[0.03] py-3 rtl:divide-x-reverse"
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 px-2">
              <dt className="text-[11px] text-white/45">{s.label}</dt>
              <dd dir="ltr" className="font-[family-name:var(--font-montserrat)] text-sm font-bold text-gold-light">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="relative z-10 mt-4 flex w-full gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-5 py-3 text-sm font-bold text-emerald-ink transition hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(205,176,116,0.7)]"
          >
            <BookOpen size={17} /> {tc.browse}
          </button>
          <a
            href={catalog.file}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-gold-light transition hover:border-gold hover:text-gold"
          >
            <Download size={17} /> {tc.download}
          </a>
        </div>
      </GlassCard>
    </article>
  );
}

/**
 * The catalog shelf and its flipbook viewer. `content` = `catalog_library`
 * heading; `catalogs` from the catalogs table. /catalog/#<slug> opens a catalog
 * directly, and the address follows the open catalog so it can be shared.
 */
export default function CatalogLibrary({ content, catalogs = [] }) {
  const { t, pick } = useLang();
  const heading = pick(content);
  const [openId, setOpenId] = useState(null);
  const openerRef = useRef(null);
  const open = catalogs.find((c) => c.id === openId) || null;

  useEffect(() => {
    const sync = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      setOpenId(catalogs.some((c) => c.id === id) ? id : null);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [catalogs]);

  const show = (id) => {
    openerRef.current = document.activeElement;
    setOpenId(id);
    history.replaceState(null, '', `#${id}`);
  };
  const close = useCallback(() => {
    setOpenId(null);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    openerRef.current?.focus?.();
  }, []);

  // The viewer texts arrive with the catalogs migration; no section without them.
  if (!heading || !t.catalog.browse) return null;

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} desc={heading.description} />
        {catalogs.length ? (
          <Stagger as="ul" gap={0.12} className="mt-20 flex flex-wrap justify-center gap-x-10 gap-y-16">
            {catalogs.map((c) => (
              <StaggerItem as="li" key={c.id} className="w-full max-w-[21rem]">
                <CatalogCard catalog={c} onOpen={() => show(c.id)} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="mt-14 text-center text-white/50">{t.catalog.empty}</p>
        )}
      </div>

      <AnimatePresence>{open && <FlipbookReader key={open.id} catalog={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}
