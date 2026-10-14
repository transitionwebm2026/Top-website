'use client';

import Image from 'next/image';
import { useLang } from '@/components/providers/LanguageProvider';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';

/**
 * Partner logo wall: numbered plaques, five to a row on desktop, the last row centred.
 * `content` = `partners_marquee` heading; `partners` from partners_and_projects.
 */
export default function BrandWall({ content, partners = [] }) {
  const { pick } = useLang();
  const heading = pick(content);
  const logos = partners.filter((p) => p.logo);
  if (!heading || !logos.length) return null;

  return (
    <section className="relative py-24">
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} desc={heading.description} />

        <Stagger as="ul" gap={0.06} className="mt-14 flex flex-wrap justify-center gap-4 sm:gap-5">
          {logos.map((b, i) => (
            <StaggerItem
              as="li"
              key={b.id}
              className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-5rem)/5)]"
            >
              <GlassCard
                {...(b.url ? { as: 'a', href: b.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group block p-2.5 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-18px_rgba(205,176,116,0.45)]"
              >
                {/* Plate in the logos' own off-white, so their backgrounds blend into it. */}
                <div className="relative z-10 rounded-2xl bg-[#f1f3f5] p-3 shadow-[inset_0_0_0_1px_rgba(205,176,116,0.25)]">
                  {/* Faded edges hide the borders and corners left in logos cut from photos. */}
                  <div className="relative aspect-[7/5] mask-x-from-92% mask-y-from-90%">
                    <Image
                      src={b.logo}
                      alt={b.name}
                      fill
                      sizes="(min-width: 640px) 192px, 40vw"
                      className="object-contain transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 px-1.5 pt-3 pb-1 font-[family-name:var(--font-montserrat)] sm:gap-3">
                  <span className="text-xs font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hidden h-px min-w-3 flex-1 bg-gradient-to-r from-gold/50 to-transparent sm:block rtl:bg-gradient-to-l" />
                  <span
                    dir="ltr"
                    title={b.name}
                    className="ms-auto truncate text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase transition group-hover:text-gold-light"
                  >
                    {b.name}
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
