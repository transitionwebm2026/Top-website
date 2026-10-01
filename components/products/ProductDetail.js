'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Gauge, Layers, Ruler, Tag } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';
import MagneticButton from '@/components/ui/MagneticButton';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import ProductVisual from './ProductVisual';

const item = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

/** Full spec-sheet view of a product line (rendered inside <Modal>). */
export default function ProductDetail({ product }) {
  const { t, pick } = useLang();
  const { waHref } = useSite();
  const [page, setPage] = useState(0);
  const tp = t.products;

  const keyFacts = [
    { icon: Ruler, label: tp.sizes, value: pick(product.sizes) },
    { icon: Gauge, label: tp.pressure, value: pick(product.pressure) },
    { icon: Layers, label: tp.standards, value: product.standards },
    { icon: Tag, label: tp.brands, value: product.brands.length ? product.brands.map(pick).join(' · ') : tp.multiBrand },
  ];

  return (
    <div className="p-5 pt-2 sm:p-10 sm:pt-4">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.div custom={0} variants={item} initial="hidden" animate="show" className="flex flex-wrap gap-2">
            {product.certs.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-light">
                <BadgeCheck size={14} /> {c}
              </span>
            ))}
          </motion.div>
          <motion.h2 custom={1} variants={item} initial="hidden" animate="show" className="mt-4 text-3xl font-black sm:text-4xl">
            {pick(product.name)}
          </motion.h2>
          <motion.p custom={2} variants={item} initial="hidden" animate="show" className="mt-4 leading-loose text-white/75">
            {pick(product.description)}
          </motion.p>

          <motion.div custom={3} variants={item} initial="hidden" animate="show" className="mt-6 grid gap-3 sm:grid-cols-2">
            {keyFacts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                  <Icon size={16} /> {label}
                </div>
                <p className="mt-1.5 text-[0.95rem] font-semibold text-white/90">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Brochure viewer */}
        <motion.div custom={2} variants={item} initial="hidden" animate="show" className="flex flex-col gap-3">
          {product.brochure.length === 0 ? (
            <ProductVisual src={product.image} icon={product.icon} alt={pick(product.name)} fit="cover" className="aspect-[3/4] rounded-2xl border border-gold/30" sizes="480px" hover={false} />
          ) : (
          <>
          <p className="text-sm font-semibold text-gold">{tp.brochure}</p>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/30 bg-emerald-night">
            <AnimatePresence mode="wait">
              <motion.div
                key={product.brochure[page]}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image src={product.brochure[page]} alt={pick(product.name)} fill sizes="(max-width: 1024px) 90vw, 480px" className="object-contain" />
              </motion.div>
            </AnimatePresence>
          </div>
          {product.brochure.length > 1 && (
            <div className="flex gap-2">
              {product.brochure.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setPage(i)}
                  aria-label={`${tp.brochure} ${i + 1}`}
                  className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition ${
                    i === page ? 'border-gold shadow-[0_0_16px_rgba(205,176,116,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          </>
          )}
        </motion.div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <motion.div custom={4} variants={item} initial="hidden" animate="show" className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="mb-4 font-bold text-gold">{tp.specs}</h3>
          <dl className="flex flex-col divide-y divide-gold/10">
            {product.specs.map((s) => (
              <div key={pick(s.k)} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-white/55">{pick(s.k)}</dt>
                <dd className="text-end font-semibold text-white/90">{pick(s.v)}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <motion.div custom={5} variants={item} initial="hidden" animate="show" className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-bold text-gold">{tp.items}</h3>
          <ul className="flex flex-wrap gap-2">
            {pick(product.items).map((x) => (
              <li key={x} className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/85 ring-1 ring-gold/20">
                {x}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div custom={6} variants={item} initial="hidden" animate="show" className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-bold text-gold">{tp.applications}</h3>
          <ul className="flex flex-col gap-2.5">
            {pick(product.applications).map((x) => (
              <li key={x} className="flex items-center gap-2.5 text-sm text-white/85">
                <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                {x}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-gold/15 pt-6 sm:flex-row sm:items-center">
        <p className="text-sm text-white/50">{tp.note}</p>
        <div className="flex flex-wrap gap-3">
          <MagneticButton href={`/products/${product.id}`} variant="gold">
            {tp.viewPage}
          </MagneticButton>
          <MagneticButton href={waHref(`${t.cta.quote}: ${pick(product.name)}`)} external variant="whatsapp">
            <WhatsAppIcon width={20} height={20} />
            {t.cta.quote}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
