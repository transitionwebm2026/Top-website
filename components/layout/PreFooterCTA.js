'use client';

import { Phone } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import MagneticButton from '@/components/ui/MagneticButton';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Contextual CTA banner with a rotating conic "glow" border.
 * `content` is the page's `pre_footer_cta` section ({ ar, en }); hidden when absent.
 */
export default function PreFooterCTA({ content }) {
  const { t, pick } = useLang();
  const { waHref, telHref, whatsapp, callNumber } = useSite();
  const c = pick(content);
  if (!c) return null;

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-6xl">
        <div className="animated-border glass-strong relative overflow-hidden rounded-[32px] px-6 py-14 text-center sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 -start-10 h-72 w-72 rounded-full bg-emerald-mid/60 blur-[90px]" />
          <div className="grid-texture pointer-events-none absolute inset-0" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-black text-balance sm:text-5xl">
              <span className="text-gold-gradient">{c.title}</span>
            </h2>
            {c.description && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">{c.description}</p>}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {whatsapp && (
                <MagneticButton href={waHref()} external variant="whatsapp">
                  <WhatsAppIcon width={22} height={22} />
                  {c.whatsapp_label || t.cta.whatsapp}
                </MagneticButton>
              )}
              {callNumber && (
                <MagneticButton href={telHref()} external variant="gold">
                  <Phone size={19} />
                  {c.call_label || t.cta.call}
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
