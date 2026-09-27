'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  ArrowUpLeft,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  Gauge,
  Layers,
  Ruler,
  Shapes,
  Star,
  Tag,
  ZoomIn,
} from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { SHAPES, brandLogos, products } from '@/lib/data/products';
import { waHref } from '@/lib/site';
import GlassCard from '@/components/ui/GlassCard';
import MagneticButton from '@/components/ui/MagneticButton';
import Modal from '@/components/ui/Modal';
import SectionHeading from '@/components/ui/SectionHeading';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import ProductVisual from './ProductVisual';
import ShapeIcon from './ShapeIcon';

const ease = [0.22, 1, 0.36, 1];
const sizeRange = (s) => (s.length > 1 ? `${s[0]} – ${s[s.length - 1]}` : s[0]);

/* ------------------------------------------------------------------ header */

function Header({ product, onPickGroup }) {
  const { t, pick, isRTL } = useLang();
  const tp = t.products;
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const Crumb = isRTL ? ChevronLeft : ChevronRight;
  const hasBrochure = product.brochure.length > 0;

  const facts = [
    { icon: Layers, label: tp.subtypes, value: `${product.groups.length} ${tp.types}` },
    { icon: Ruler, label: tp.sizes, value: pick(product.sizes) },
    { icon: Tag, label: tp.brands, value: product.brands.length ? product.brands.map(pick).join(' · ') : tp.multiBrand },
    { icon: Gauge, label: tp.standards, value: product.standards },
  ];

  return (
    <section className="relative isolate overflow-hidden px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20">
        <Image src={product.brochure[0] || '/images/cover.jpg'} alt="" fill priority sizes="100vw" className="scale-110 object-cover blur-md" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-ink/90 via-emerald-ink/85 to-emerald-ink" />
      <div className="grid-texture absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl">
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          aria-label="breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-white/55"
        >
          <Link href="/" className="hover:text-gold">
            {t.nav.home}
          </Link>
          <Crumb size={14} />
          <Link href="/products" className="hover:text-gold">
            {tp.catalog}
          </Link>
          <Crumb size={14} />
          <span className="font-semibold text-gold-light">{pick(product.name)}</span>
        </motion.nav>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease }} className="flex flex-wrap gap-2">
              {product.certs.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-light">
                  <BadgeCheck size={14} /> {c}
                </span>
              ))}
            </motion.div>
            <h1 className="mt-5 overflow-hidden pb-2 text-4xl leading-tight font-black sm:text-5xl lg:text-6xl">
              <motion.span className="block" initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.15, ease }}>
                {pick(product.name)}
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="mt-5 max-w-2xl text-lg leading-loose text-white/70"
            >
              {pick(product.description)}
            </motion.p>

            {/* Sub-type quick links */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease }} className="mt-6 flex flex-wrap gap-2">
              {product.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onPickGroup(g.id, true)}
                  className="glass inline-flex items-center gap-2 rounded-full py-1.5 ps-1.5 pe-4 text-sm font-semibold text-white/85 transition hover:border-gold hover:text-gold"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0c2218]">
                    <ShapeIcon name={g.icon} className="h-5 w-5" />
                  </span>
                  {pick(g.name)}
                </button>
              ))}
            </motion.div>

            <Stagger className="mt-8 grid gap-3 sm:grid-cols-2" gap={0.08} delay={0.45}>
              {facts.map(({ icon: Icon, label, value }) => (
                <StaggerItem key={label}>
                  <GlassCard className="h-full p-4">
                    <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-gold">
                      <Icon size={16} /> {label}
                    </div>
                    <p className="relative z-10 mt-1.5 font-semibold text-white/90">{value}</p>
                  </GlassCard>
                </StaggerItem>
              ))}
            </Stagger>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }} className="mt-9 flex flex-wrap gap-4">
              <MagneticButton href={waHref(`${t.cta.quote}: ${pick(product.name)}`)} external variant="whatsapp">
                <WhatsAppIcon width={20} height={20} />
                {t.cta.quote}
              </MagneticButton>
              <MagneticButton href="#types" external variant="glass">
                {tp.rangeEyebrow}
              </MagneticButton>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease }}
            className="mx-auto w-full max-w-md"
          >
            <div className="relative">
              <div className="absolute -inset-3 rotate-2 rounded-[30px] border border-gold/30" />
              {hasBrochure ? (
                <button
                  onClick={() => setZoom(true)}
                  className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[26px] border border-gold/30 bg-emerald-night shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
                  aria-label={tp.brochure}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={product.brochure[page]}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Image src={product.brochure[page]} alt={pick(product.name)} fill sizes="450px" className="object-cover" />
                    </motion.div>
                  </AnimatePresence>
                  <span className="absolute inset-0 grid place-items-center bg-emerald-ink/0 transition group-hover:bg-emerald-ink/40">
                    <ZoomIn size={38} className="scale-50 text-gold opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />
                  </span>
                </button>
              ) : (
                <div className="group relative overflow-hidden rounded-[26px] border border-gold/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
                  <ProductVisual src={product.image} icon={product.icon} alt={pick(product.name)} className="aspect-[3/4]" sizes="450px" />
                </div>
              )}
            </div>
            {product.brochure.length > 1 && (
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {product.brochure.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setPage(i)}
                    aria-label={`${tp.brochure} ${i + 1}`}
                    className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition ${
                      i === page ? 'border-gold shadow-[0_0_16px_rgba(205,176,116,0.5)]' : 'border-transparent opacity-55 hover:opacity-100'
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {hasBrochure && (
        <Modal open={zoom} onClose={() => setZoom(false)} size="md" label={tp.brochure}>
          <div className="p-4 pt-0 sm:p-8 sm:pt-0">
            <Image src={product.brochure[page]} alt={pick(product.name)} width={896} height={1200} className="h-auto w-full rounded-2xl" />
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- overview */

function Overview({ product }) {
  const { t, pick } = useLang();
  const tp = t.products;
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <Stagger className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3" gap={0.1}>
        <StaggerItem>
          <GlassCard className="h-full p-7">
            <h2 className="relative z-10 mb-4 text-lg font-bold text-gold">{tp.specs}</h2>
            <dl className="relative z-10 flex flex-col divide-y divide-gold/10">
              {product.specs.map((s) => (
                <div key={pick(s.k)} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-white/55">{pick(s.k)}</dt>
                  <dd className="text-end font-semibold text-white/90">{pick(s.v)}</dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard className="h-full p-7">
            <h2 className="relative z-10 mb-4 text-lg font-bold text-gold">{tp.pressure}</h2>
            <p className="relative z-10 text-xl font-bold text-white/90 [unicode-bidi:plaintext]">{pick(product.pressure)}</p>
            <h2 className="relative z-10 mt-6 mb-3 text-lg font-bold text-gold">{tp.standards}</h2>
            <p className="relative z-10 font-semibold text-white/80">{product.standards}</p>
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard className="h-full p-7">
            <h2 className="relative z-10 mb-4 text-lg font-bold text-gold">{tp.applications}</h2>
            <ul className="relative z-10 flex flex-col gap-3">
              {pick(product.applications).map((x) => (
                <li key={x} className="flex items-center gap-3 text-white/85">
                  <span className="h-2 w-2 shrink-0 rotate-45 bg-gold" />
                  {x}
                </li>
              ))}
            </ul>
          </GlassCard>
        </StaggerItem>
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------- group panel */

function BrandLogo({ name }) {
  const logo = brandLogos[name];
  if (!logo) return null;
  return (
    <span className="relative block h-7 w-10 shrink-0 overflow-hidden rounded-md bg-white">
      <Image src={logo} alt="" fill sizes="40px" className="object-contain p-0.5" />
    </span>
  );
}

function GroupPanel({ product, group }) {
  const { t, pick } = useLang();
  const tp = t.products;
  const [brandIdx, setBrandIdx] = useState(0);
  const [shape, setShape] = useState(null);

  const brand = group.brands[brandIdx];
  const brandName = brand ? pick(brand.name) : '';
  const image = brand?.image ?? group.image;
  const datasheet = brand?.datasheet || group.datasheet;
  const groupName = pick(group.name);
  const shapeName = shape ? pick(SHAPES[shape]) : '';
  const label = [groupName, brandName, shapeName].filter(Boolean).join(' — ');

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      {/* Visual + brand switcher */}
      <div className="flex flex-col gap-5">
        <div className="group relative overflow-hidden rounded-3xl border border-gold/25">
          {/* Keyed so it replays a CSS fade on each brand switch; no exit wait, never stuck hidden. */}
          <div key={`${image}-${brandIdx}`} className="animate-fade-in">
            <ProductVisual src={image} icon={group.icon} alt={label} className="aspect-[4/3]" sizes="(max-width:1024px) 95vw, 560px" imgClassName="p-6" />
          </div>
          {brand && (
            <span className="absolute top-4 start-4 inline-flex items-center gap-2 rounded-full bg-emerald-deep/90 py-1 ps-1 pe-3 text-xs font-bold text-gold backdrop-blur">
              <BrandLogo name={brand.name} />
              {brandName}
            </span>
          )}
        </div>

        {group.brands.length > 0 ? (
          <>
            <div>
              <p className="mb-3 text-sm font-semibold text-gold">{tp.chooseBrand}</p>
              <LayoutGroup id={`brands-${group.id}`}>
                <div className="flex flex-wrap gap-2">
                  {group.brands.map((b, i) => (
                    <button
                      key={pick(b.name)}
                      onClick={() => setBrandIdx(i)}
                      className={`relative isolate inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition ${
                        i === brandIdx ? 'border-gold text-emerald-ink' : 'border-gold/25 text-white/80 hover:border-gold/60'
                      }`}
                    >
                      {i === brandIdx && (
                        <motion.span layoutId="brand-active" className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-gold-light to-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                      )}
                      <BrandLogo name={b.name} />
                      {pick(b.name)}
                      {b.primary && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] ${
                            i === brandIdx ? 'bg-emerald-ink/15 text-emerald-ink' : 'bg-gold/15 text-gold'
                          }`}
                        >
                          <Star size={10} className="fill-current" /> {tp.primaryBrand}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </div>
            <p key={brandIdx} className="animate-fade-in rounded-2xl border border-gold/15 bg-white/[0.03] p-4 leading-relaxed text-white/75">
              {pick(brand.desc)}
            </p>
          </>
        ) : (
          <p className="rounded-2xl border border-gold/15 bg-white/[0.03] p-4 leading-relaxed text-white/70">{tp.onRequest}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {datasheet ? (
            <a
              href={datasheet}
              download
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-5 py-3 text-sm font-bold text-emerald-ink transition hover:scale-105"
            >
              <FileDown size={17} /> {tp.datasheet}
            </a>
          ) : (
            <a
              href={waHref(`${tp.requestDatasheet}: ${label}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-gold-light transition hover:border-gold"
            >
              <FileText size={17} /> {tp.requestDatasheet}
            </a>
          )}
          <a
            href={waHref(`${t.cta.quote}: ${label}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-bold text-white transition hover:scale-105"
          >
            <WhatsAppIcon width={17} height={17} /> {t.cta.quote}
          </a>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-black sm:text-3xl">{groupName}</h3>
          <p className="mt-3 leading-relaxed text-white/65">{pick(group.desc)}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 font-semibold text-white/80 ring-1 ring-gold/20 [unicode-bidi:plaintext]">
              <Gauge size={13} className="text-gold" /> {pick(group.pressure)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 font-semibold text-white/80 ring-1 ring-gold/20">
              <Layers size={13} className="text-gold" /> {group.standard}
            </span>
            {group.specs.map((s) => (
              <span key={pick(s.k)} className="rounded-full bg-white/5 px-3 py-1.5 text-white/70 ring-1 ring-white/10">
                {pick(s.k)}: <b className="font-semibold text-white/90">{pick(s.v)}</b>
              </span>
            ))}
          </div>
        </div>

        {group.shapes?.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold">
              <Shapes size={15} /> {tp.shapes}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {group.shapes.map((s) => {
                const on = shape === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setShape(on ? null : s.key)}
                    aria-pressed={on}
                    className={`group overflow-hidden rounded-2xl border text-center transition ${
                      on ? 'border-gold shadow-[0_0_20px_-4px_rgba(205,176,116,0.7)]' : 'border-gold/20 hover:border-gold/60'
                    }`}
                  >
                    <ProductVisual src={s.image} icon={s.key} className="aspect-square" sizes="120px" imgClassName="p-2" note={false} />
                    <span className={`block px-1 py-2 text-xs font-bold ${on ? 'bg-gold text-emerald-ink' : 'bg-white/[0.03] text-white/85'}`}>
                      {pick(SHAPES[s.key])}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gold">
            <span className="flex items-center gap-2">
              <Ruler size={15} /> {tp.sizes}
            </span>
            <span className="text-xs font-normal text-white/40">{tp.sizeHint}</span>
          </div>
          <div className="flex flex-wrap gap-2" dir="ltr">
            {group.sizes.map((s) => (
              <a
                key={s}
                href={waHref(`${t.cta.quote}: ${label} — ${s}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gold/25 bg-white/[0.04] px-3.5 py-2 font-[family-name:var(--font-montserrat)] text-sm font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-emerald-ink"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ types section */

function Types({ product, active, onPickGroup }) {
  const { t, pick } = useLang();
  const tp = t.products;
  const group = product.groups.find((g) => g.id === active) || product.groups[0];

  return (
    <section id="types" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={tp.rangeEyebrow} title={tp.rangeTitle} desc={tp.rangeDesc} />

        <LayoutGroup id="group-tabs">
          <div className="sticky top-24 z-30 mt-10 flex justify-center">
            <div className="glass-strong no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
              {product.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onPickGroup(g.id)}
                  className={`relative isolate flex shrink-0 items-center gap-2 rounded-full py-2 ps-2 pe-4 text-sm font-bold whitespace-nowrap transition-colors ${
                    g.id === group.id ? 'text-emerald-ink' : 'text-white/70 hover:text-gold'
                  }`}
                >
                  {g.id === group.id && (
                    <motion.span layoutId="group-pill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-gold-light to-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className={`grid h-7 w-7 place-items-center rounded-full ${g.id === group.id ? 'bg-emerald-ink' : 'bg-[#0c2218]'}`}>
                    <ShapeIcon name={g.icon} className="h-5 w-5" />
                  </span>
                  {pick(g.name)}
                </button>
              ))}
            </div>
          </div>
        </LayoutGroup>

        <GlassCard strong className="mt-8 p-5 sm:p-8">
          {/* Keyed on the tab: remounts the panel (resets brand/shape) and replays a CSS enter animation. */}
          <div key={group.id} className="animate-panel-in relative z-10">
            <GroupPanel product={product} group={group} />
          </div>
        </GlassCard>

        {/* Comparison table */}
        <Reveal className="mt-14">
          <h3 className="mb-5 text-xl font-extrabold">{tp.compareTitle}</h3>
          <div className="glass overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gold/20 text-gold">
                  {[tp.product, tp.brands, tp.sizes, tp.pressure, tp.standard].map((h) => (
                    <th key={h} className="px-5 py-4 text-start font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.groups.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => onPickGroup(g.id, true)}
                    className={`cursor-pointer border-b border-gold/10 transition last:border-0 hover:bg-gold/[0.07] ${g.id === group.id ? 'bg-gold/[0.08]' : ''}`}
                  >
                    <td className="px-5 py-4 font-semibold text-white/90">
                      <span className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#0c2218]">
                          <ShapeIcon name={g.icon} className="h-6 w-6" />
                        </span>
                        {pick(g.name)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/70">{g.brands.length ? g.brands.map((b) => pick(b.name)).join(' · ') : tp.multiBrand}</td>
                    <td className="px-5 py-4 font-[family-name:var(--font-montserrat)] font-semibold whitespace-nowrap text-gold-light" dir="ltr">
                      {sizeRange(g.sizes)}
                    </td>
                    <td className="px-5 py-4 text-white/70 [unicode-bidi:plaintext]">{pick(g.pressure)}</td>
                    <td className="px-5 py-4 text-white/60 [unicode-bidi:plaintext]">{g.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-white/45">{tp.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- other lines */

function OtherLines({ current }) {
  const { t, pick, isRTL } = useLang();
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const others = products.filter((p) => p.id !== current);
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading align="start" eyebrow={t.nav.products} title={t.products.otherLines} />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
          {others.map((p) => (
            <StaggerItem key={p.id}>
              <GlassCard as={Link} href={`/products/${p.id}`} className="group flex h-full flex-col p-3 hover:-translate-y-1.5">
                <ProductVisual src={p.image} icon={p.icon} alt={pick(p.name)} className="relative z-10 h-28 rounded-2xl" sizes="300px" imgClassName="p-2" note={false} />
                <div className="relative z-10 flex flex-1 items-center justify-between gap-3 p-3">
                  <div>
                    <h3 className="font-bold">{pick(p.name)}</h3>
                    <p className="mt-0.5 text-xs text-white/50">
                      {p.groups.length} {t.products.types}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/40 text-gold transition duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-emerald-ink">
                    <Arrow size={16} />
                  </span>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- page */

export default function ProductPageView({ id }) {
  const product = products.find((p) => p.id === id);
  const [active, setActive] = useState(product.groups[0].id);

  // Deep link: /products/<line>#<group> opens that sub-type tab.
  useEffect(() => {
    const sync = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (product.groups.some((g) => g.id === h)) {
        setActive(h);
        requestAnimationFrame(() => document.getElementById('types')?.scrollIntoView({ behavior: 'smooth' }));
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [product]);

  // Warm the browser cache with every photo on this page (all tabs, brands and
  // shapes) so switching filters shows the image instantly.
  useEffect(() => {
    const urls = new Set();
    product.groups.forEach((g) => {
      if (g.image) urls.add(g.image);
      g.brands.forEach((b) => b.image && urls.add(b.image));
      g.shapes?.forEach((s) => s.image && urls.add(s.image));
    });
    urls.forEach((u) => {
      const img = new window.Image();
      img.src = u;
    });
  }, [product]);

  const pickGroup = useCallback((gid, scroll = false) => {
    setActive(gid);
    history.replaceState(null, '', `#${gid}`);
    if (scroll) document.getElementById('types')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <Header product={product} onPickGroup={pickGroup} />
      <Overview product={product} />
      <Types product={product} active={active} onPickGroup={pickGroup} />
      <OtherLines current={product.id} />
    </>
  );
}
