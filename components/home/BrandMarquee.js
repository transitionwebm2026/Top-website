'use client';

import Image from 'next/image';
import { useLang } from '@/components/providers/LanguageProvider';
import { brands } from '@/lib/data/company';
import SectionHeading from '@/components/ui/SectionHeading';

function Row({ items, reverse }) {
  // Duplicated list + translateX(-50%) = seamless loop. Forced LTR so RTL doesn't break it.
  return (
    <div
      dir="ltr"
      className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
    >
      <div
        className="flex w-max shrink-0 animate-marquee gap-5 py-3 group-hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: 'reverse', animationDuration: '48s' } : undefined}
      >
        {[...items, ...items].map((b, i) => (
          <div
            key={`${b.name}-${i}`}
            className="glass group/logo flex h-28 w-52 shrink-0 items-center justify-center rounded-2xl p-3 transition duration-500 hover:-translate-y-1 hover:border-gold/80 hover:shadow-[0_0_30px_-6px_rgba(205,176,116,0.6)]"
            aria-hidden={i >= items.length}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-white/95 grayscale-[35%] transition duration-500 group-hover/logo:grayscale-0">
              <Image src={b.logo} alt={b.name} fill sizes="208px" className="object-contain p-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandMarquee() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden py-24">
      <div className="px-4">
        <SectionHeading eyebrow={t.home.brandsEyebrow} title={t.home.brandsTitle} />
      </div>
      <div className="mt-14 flex flex-col gap-4">
        <Row items={brands} />
        <Row items={[...brands].reverse()} reverse />
      </div>
    </section>
  );
}
