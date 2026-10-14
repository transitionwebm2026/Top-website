'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, BadgeCheck, BookOpen, Download, FileText, HardDrive, Layers } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { FlipbookReader, formatSize, preloadReader } from './reader';

const SPRING = { type: 'spring', stiffness: 140, damping: 22, mass: 0.9 };
const pad = (n) => String(n).padStart(2, '0');

/**
 * Where a book stands on the stage, by its distance `d` from the selected one
 * (of `n`): in front, or smaller and turned behind it on either side. With two
 * catalogs the second stands behind on the right. `x` is a share of the book's width.
 */
function slot(d, n) {
  if (d === 0) return { x: n === 2 ? '-14%' : '0%', scale: 1, rotateY: -18, opacity: 1, z: 3 };
  if (d === 1) return { x: n === 2 ? '50%' : '62%', scale: 0.74, rotateY: -34, opacity: 0.5, z: 2 };
  if (d === n - 1) return { x: '-62%', scale: 0.74, rotateY: -6, opacity: 0.5, z: 2 };
  return { x: '0%', scale: 0.6, rotateY: -18, opacity: 0, z: 1 };
}

/** One catalog as a closed book in 3D: cover, page block along the fore-edge and back cover. */
function StageBook({ catalog, d, n, label, hint, onClick }) {
  const s = slot(d, n);
  const front = d === 0;
  const shown = s.opacity > 0;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center [perspective:1600px]" style={{ zIndex: s.z }}>
      <motion.button
        type="button"
        onClick={onClick}
        onPointerEnter={front ? preloadReader : undefined}
        onFocus={front ? preloadReader : undefined}
        tabIndex={shown ? 0 : -1}
        aria-hidden={shown ? undefined : true}
        aria-label={label}
        initial={false}
        animate={{ x: s.x, scale: s.scale, rotateY: s.rotateY, opacity: s.opacity }}
        whileHover={front ? { rotateY: -8, y: -10 } : { opacity: 0.85 }}
        transition={SPRING}
        style={{ transformStyle: 'preserve-3d' }}
        className={`group relative aspect-[17/24] w-[42%] cursor-pointer rounded-[3px_8px_8px_3px] outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${shown ? 'pointer-events-auto' : ''}`}
      >
        {/* Back cover and page block */}
        <span className="absolute inset-0 rounded-[3px_8px_8px_3px] bg-emerald-night shadow-[28px_34px_60px_-14px_rgba(0,0,0,0.85)] [transform:translateZ(-22px)]" />
        <span className="absolute inset-y-[1.4%] left-[calc(100%-3px)] w-[22px] origin-left bg-[repeating-linear-gradient(90deg,#f6f3ec_0_2px,#ddd6c6_2px_3px)] [transform:rotateY(90deg)]" />
        {/* Cover */}
        <span className="absolute inset-0 overflow-hidden rounded-[3px_8px_8px_3px] bg-emerald-deep">
          {catalog.cover ? (
            <Image src={catalog.cover} alt="" fill sizes="(min-width: 1024px) 240px, 42vw" className="object-cover" />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-3 border border-gold/40 bg-gradient-to-br from-emerald-mid via-emerald-deep to-emerald-ink p-4 text-center">
              <FileText size={40} strokeWidth={1.2} className="text-gold" />
              <span className="text-xs leading-snug font-bold text-gold-light">{label}</span>
            </span>
          )}
          {/* Spine crease and a soft gloss */}
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(255,255,255,0.22)_2.2%,rgba(0,0,0,0.14)_4.5%,transparent_9%)]" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/25" />
          {front && (
            <span className="absolute inset-0 grid place-items-center bg-emerald-ink/0 transition duration-500 group-hover:bg-emerald-ink/45">
              <span className="inline-flex scale-75 items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-bold text-emerald-ink opacity-0 shadow-lg transition duration-500 group-hover:scale-100 group-hover:opacity-100">
                <BookOpen size={16} /> {hint}
              </span>
            </span>
          )}
        </span>
      </motion.button>
    </div>
  );
}

/**
 * The PDF catalogs on a product line page: the selected catalog as a book on a
 * stage with its details, browsed in the flipbook viewer or downloaded. The
 * catalogs of this line (`line` = its slug) come first and open selected.
 */
export default function CatalogShowcase({ catalogs = [], line }) {
  const { t, pick, isRTL } = useLang();
  const tc = t.catalog;
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const list = useMemo(() => [...catalogs.filter((c) => c.line === line), ...catalogs.filter((c) => c.line !== line)], [catalogs, line]);
  const [activeId, setActiveId] = useState(null);
  const [readingId, setReadingId] = useState(null);
  const openerRef = useRef(null);

  const close = useCallback(() => {
    setReadingId(null);
    openerRef.current?.focus?.();
  }, []);

  // The viewer texts arrive with the catalogs migration; no section without them.
  if (!list.length || !tc.browse) return null;

  const index = Math.max(0, list.findIndex((c) => c.id === activeId));
  const active = list[index];
  const reading = list.find((c) => c.id === readingId) || null;
  const read = () => {
    openerRef.current = document.activeElement;
    setReadingId(active.id);
  };

  const title = pick(active.title);
  const stats = [
    active.pages && { icon: Layers, label: tc.pages, value: active.pages },
    active.size && { icon: HardDrive, label: tc.size, value: formatSize(active.size) },
    { icon: FileText, label: tc.format, value: 'PDF' },
  ].filter(Boolean);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading align="start" eyebrow={t.nav.catalog} title={tc.showcaseTitle} desc={tc.showcaseDesc} />
          <Reveal>
            <Link
              href="/catalog"
              className="glass group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-gold-light transition hover:border-gold hover:text-gold"
            >
              {tc.all}
              <Arrow size={16} className="transition duration-500 group-hover:rotate-45" />
            </Link>
          </Reveal>
        </div>

        <Reveal className="mt-10">
          <GlassCard strong className="grid items-center gap-8 p-4 sm:p-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-8">
            {/* Stage */}
            <div
              dir="ltr"
              className="relative z-10 aspect-[6/5] w-full overflow-hidden rounded-[22px] border border-gold/15 bg-[radial-gradient(ellipse_at_50%_42%,rgba(205,176,116,0.24),transparent_62%),linear-gradient(180deg,#10291d,#08170f)]"
            >
              <div className="grid-texture absolute inset-0 opacity-60" />
              <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-[12%] left-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/45 to-transparent" />

              {list.map((c, i) => (
                <StageBook
                  key={c.id}
                  catalog={c}
                  d={(i - index + list.length) % list.length}
                  n={list.length}
                  label={pick(c.title)}
                  hint={tc.browse}
                  onClick={i === index ? read : () => setActiveId(c.id)}
                />
              ))}

              {list.length > 1 && (
                <span className="absolute top-4 right-4 z-10 font-[family-name:var(--font-montserrat)] text-sm font-bold tracking-widest text-gold-light">
                  {pad(index + 1)}
                  <span className="text-white/35"> / {pad(list.length)}</span>
                </span>
              )}
              <span
                key={active.id}
                className="glass absolute bottom-4 left-4 z-10 inline-flex animate-fade-in items-center gap-2 rounded-full px-3 py-1.5 font-[family-name:var(--font-montserrat)] text-xs font-bold text-white/85"
              >
                <FileText size={14} className="text-gold" /> PDF
                {active.size && <span className="font-semibold text-white/50">· {formatSize(active.size)}</span>}
              </span>
            </div>

            {/* Details */}
            <div className="relative z-10 flex flex-col">
              <div key={active.id} className="animate-panel-in">
                <div className="flex flex-wrap items-center gap-2">
                  {active.line === line && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-gold-light to-gold px-3 py-1 text-xs font-extrabold text-emerald-ink">
                      <BadgeCheck size={14} /> {tc.forLine}
                    </span>
                  )}
                  {pick(active.category) && (
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold-light ring-1 ring-gold/30">{pick(active.category)}</span>
                  )}
                  {active.brand && (
                    <span dir="ltr" className="rounded-full px-3 py-1 font-[family-name:var(--font-montserrat)] text-xs font-bold tracking-wider text-white/70 ring-1 ring-white/15">
                      {active.brand}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-2xl leading-snug font-black text-balance sm:text-3xl">{title}</h3>
                {pick(active.desc) && <p className="mt-3 leading-relaxed text-white/65">{pick(active.desc)}</p>}

                <dl className="mt-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
                  {stats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col rounded-2xl border border-gold/15 bg-white/[0.03] p-3 sm:p-4">
                      <dt className="order-last mt-0.5 text-xs text-white/45">{label}</dt>
                      <dd className="flex flex-col gap-2">
                        <Icon size={18} className="text-gold" />
                        <span dir="ltr" className="self-start font-[family-name:var(--font-montserrat)] text-lg font-bold text-white">
                          {value}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={read}
                    onPointerEnter={preloadReader}
                    onFocus={preloadReader}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-6 py-3.5 text-sm font-bold text-emerald-ink transition hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(205,176,116,0.7)]"
                  >
                    <BookOpen size={18} /> {tc.browse}
                  </button>
                  <a
                    href={active.file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-gold-light transition hover:border-gold hover:text-gold"
                  >
                    <Download size={18} /> {tc.download} PDF
                  </a>
                </div>
              </div>

              {list.length > 1 && (
                <div className="mt-8 border-t border-gold/10 pt-6">
                  <p className="mb-3 text-sm font-semibold text-gold">{tc.choose}</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {list.map((c) => {
                      const on = c.id === active.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setActiveId(c.id)}
                          aria-pressed={on}
                          className={`flex items-center gap-3 rounded-2xl border p-2 pe-4 text-start transition ${
                            on ? 'border-gold/70 bg-gold/10 shadow-[0_0_24px_-8px_rgba(205,176,116,0.6)]' : 'border-gold/15 bg-white/[0.02] hover:border-gold/45'
                          }`}
                        >
                          <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-[2px_5px_5px_2px] bg-emerald-night shadow-[4px_6px_12px_-4px_rgba(0,0,0,0.8)]">
                            {c.cover ? (
                              <Image src={c.cover} alt="" fill sizes="40px" className="object-cover" />
                            ) : (
                              <FileText size={18} className="absolute inset-0 m-auto text-gold" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white/90">{pick(c.title)}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                              {c.line === line && <BadgeCheck size={13} className="shrink-0 text-gold" />}
                              <span className="truncate">{[c.brand, pick(c.category)].filter(Boolean).join(' · ')}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </Reveal>
      </div>

      <AnimatePresence>{reading && <FlipbookReader key={reading.id} catalog={reading} onClose={close} />}</AnimatePresence>
    </section>
  );
}
