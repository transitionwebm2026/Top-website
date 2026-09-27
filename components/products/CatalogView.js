'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { products } from '@/lib/data/products';
import GlassCard from '@/components/ui/GlassCard';
import ProductVisual from './ProductVisual';
import ShapeIcon from './ShapeIcon';

const sizeRange = (s) => (s.length > 1 ? `${s[0]} – ${s[s.length - 1]}` : s[0]);

export default function CatalogView() {
  const { t, pick, isRTL } = useLang();
  const [filter, setFilter] = useState('all');
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const tp = t.products;

  const tabs = [{ id: 'all', label: tp.all }, ...products.map((p) => ({ id: p.id, label: pick(p.name) }))];
  const visible = filter === 'all' ? products : products.filter((p) => p.id === filter);

  return (
    <section id="content" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Filter tabs */}
        <LayoutGroup>
          <div className="glass no-scrollbar sticky top-24 z-30 mx-auto flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5 lg:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative isolate shrink-0 rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
                  filter === tab.id ? 'text-emerald-ink' : 'text-white/70 hover:text-gold'
                }`}
              >
                {filter === tab.id && (
                  <motion.span
                    layoutId="catalog-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-light to-gold"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Split cards: image side alternates; each card lists its sub-types as deep links */}
        <motion.div layout className="mt-14 flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => {
              const flip = i % 2 === 1;
              const index = String(products.indexOf(p) + 1).padStart(2, '0');
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GlassCard className="group grid overflow-hidden p-3 sm:p-4 lg:grid-cols-12 lg:gap-6">
                    <Link
                      href={`/products/${p.id}`}
                      className={`relative z-10 block overflow-hidden rounded-2xl lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}
                      aria-label={pick(p.name)}
                    >
                      <ProductVisual
                        src={p.image}
                        icon={p.icon}
                        alt={pick(p.name)}
                        className="h-60 sm:h-72 lg:h-full lg:min-h-[380px]"
                        sizes="(max-width:1024px) 95vw, 520px"
                        imgClassName="p-5"
                      />
                      <span className="absolute top-4 start-4 rounded-full bg-emerald-deep px-3 py-1 font-[family-name:var(--font-montserrat)] text-xs font-bold text-gold">
                        {index}
                      </span>
                    </Link>

                    <div className="relative z-10 flex flex-col p-4 sm:p-6 lg:col-span-7 lg:px-4">
                      <div className="flex flex-wrap gap-2">
                        {p.certs.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-light ring-1 ring-gold/25">
                            <BadgeCheck size={13} /> {c}
                          </span>
                        ))}
                      </div>
                      <h2 className="mt-4 text-2xl font-black sm:text-3xl">{pick(p.name)}</h2>
                      <p className="mt-3 leading-relaxed text-white/65">{pick(p.short)}</p>

                      {/* Sub-types */}
                      <div className="mt-6">
                        <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-gold">
                          <Layers size={15} /> {tp.subtypes} ({p.groups.length})
                        </p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {p.groups.map((g) => (
                            <li key={g.id}>
                              <Link
                                href={`/products/${p.id}#${g.id}`}
                                className="group/row flex items-center gap-3 rounded-2xl border border-gold/15 bg-white/[0.03] p-2 pe-3 transition hover:border-gold/60 hover:bg-gold/[0.06]"
                              >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0c2218]">
                                  <ShapeIcon name={g.icon} className="h-7 w-7" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="line-clamp-2 block text-sm leading-snug font-bold text-white/90">{pick(g.name)}</span>
                                  <span className="block font-[family-name:var(--font-montserrat)] text-xs text-gold-light/80" dir="ltr">
                                    {sizeRange(g.sizes)}
                                  </span>
                                </span>
                                <Chevron size={16} className="shrink-0 text-gold/60 transition group-hover/row:translate-x-0.5 group-hover/row:text-gold rtl:group-hover/row:-translate-x-0.5" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-2 lg:mt-auto">
                        <div className="flex flex-wrap gap-2">
                          {(p.brands.length ? p.brands : [tp.multiBrand]).map((b) => (
                            <span key={pick(b)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 ring-1 ring-white/10">
                              {pick(b)}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/products/${p.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-6 py-3 text-sm font-bold text-emerald-ink shadow-[0_10px_30px_-10px_rgba(205,176,116,0.8)] transition hover:scale-105"
                        >
                          {t.cta.details}
                          <Arrow size={16} />
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
