'use client';

import { useState } from 'react';
import { ArrowUpLeft, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { products } from '@/lib/data/products';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import SectionHeading from '@/components/ui/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import ProductDetail from '@/components/products/ProductDetail';
import ProductVisual from '@/components/products/ProductVisual';

export default function ProductBento() {
  const { t, pick, isRTL } = useLang();
  const [active, setActive] = useState(null);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t.home.productsEyebrow} title={t.home.productsTitle} />

        {/* Full-width rows stacked vertically; the image side alternates on desktop. */}
        <Stagger className="mt-14 flex flex-col gap-6" gap={0.12}>
          {products.map((p, idx) => {
            const flip = idx % 2 === 1;
            return (
              <StaggerItem key={p.id}>
                <GlassCard
                  as="button"
                  onClick={() => setActive(p)}
                  className="group grid w-full overflow-hidden p-4 text-start hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(205,176,116,0.35)] sm:p-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8"
                >
                  <div className={`relative z-10 overflow-hidden rounded-2xl ${flip ? 'md:order-2' : ''}`}>
                    <ProductVisual src={p.image} icon={p.icon} alt={pick(p.name)} className="h-48 sm:h-56 md:h-64" sizes="(max-width: 768px) 100vw, 680px" />
                    <span className="absolute top-3 start-3 rounded-full bg-emerald-deep px-3 py-1 font-[family-name:var(--font-montserrat)] text-xs font-bold text-gold">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="relative z-10 mt-5 flex flex-col justify-center md:mt-0 md:py-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-extrabold sm:text-3xl">{pick(p.name)}</h3>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-emerald-ink">
                        <Arrow size={18} />
                      </span>
                    </div>
                    <p className="mt-3 leading-relaxed text-white/65">{pick(p.short)}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.certs.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-light ring-1 ring-gold/25">
                          <BadgeCheck size={12} /> {c}
                        </span>
                      ))}
                      {p.brands.map((b) => (
                        <span key={pick(b)} className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                          {pick(b)}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} label={active ? pick(active.name) : ''}>
        {active && <ProductDetail product={active} />}
      </Modal>
    </section>
  );
}
