'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLang } from '@/components/providers/LanguageProvider';
import Counter from '@/components/ui/Counter';
import GlassCard from '@/components/ui/GlassCard';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

const RING_LENGTH = 2 * Math.PI * 86 - 2; // the r=86 circle, less a hair so the last letter isn't dropped
const RING_SIZE = 10.5;

/**
 * Size and spacing that make `length` (the text at RING_SIZE, unspaced) go once around the ring:
 * the space grows between letters, or between words in Arabic, whose letters join (Arabic
 * text, shorter, may first grow a little). Text too long for the ring gets smaller.
 */
function fitRing(length, gaps, rtl) {
  const [minGap, maxScale] = rtl ? [0.3, 1.25] : [0.12, 1]; // narrowest gap (em), largest font scale
  const scale = Math.min(maxScale, RING_LENGTH / (length + gaps * minGap * RING_SIZE));
  return { size: RING_SIZE * scale, spacing: (RING_LENGTH - length * scale) / gaps };
}

/** `text` around the hexagon badge, turning slowly. */
function RingText({ text, rtl }) {
  const id = useId();
  const measure = useRef(null);
  const [fit, setFit] = useState({ size: RING_SIZE, spacing: rtl ? 0 : RING_SIZE * 0.3 });
  // A no-break space closes the ring with the same gap as the other words.
  const ring = `${text.trim()} `;

  useEffect(() => {
    const el = measure.current;
    const gaps = rtl ? (ring.match(/[  ]/g) || []).length : ring.length;
    const refit = () => {
      const length = el?.getComputedTextLength();
      if (length && gaps) setFit(fitRing(length, gaps, rtl));
    };
    refit();
    // Measured again once the web font has loaded.
    document.fonts?.ready.then(refit);
    document.fonts?.addEventListener('loadingdone', refit);
    return () => document.fonts?.removeEventListener('loadingdone', refit);
  }, [ring, rtl]);

  const font = 'fill-current font-semibold';
  return (
    <svg viewBox="0 0 200 200" className="animate-ring-spin absolute inset-0 text-gold/60" aria-hidden>
      <defs>
        <path id={id} d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
      </defs>
      <text ref={measure} className={font} direction={rtl ? 'rtl' : 'ltr'} fontSize={RING_SIZE} visibility="hidden">
        {ring}
      </text>
      <text
        className={font}
        direction={rtl ? 'rtl' : 'ltr'}
        textAnchor="middle"
        style={{ fontSize: fit.size, [rtl ? 'wordSpacing' : 'letterSpacing']: fit.spacing }}
      >
        <textPath href={`#${id}`} startOffset="50%">
          {ring}
        </textPath>
      </text>
    </svg>
  );
}

/** Home "about summary": hex counter in a rotating text ring + stats. `content` = `about_summary` section. */
export default function ExperienceHighlight({ content }) {
  const { pick, isRTL } = useLang();
  const h = pick(content);
  if (!h) return null;
  const stats = h.stats || [];

  return (
    <section id="content" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[auto_1fr]">
        {/* Hexagon badge */}
        <Reveal className="relative mx-auto grid h-72 w-72 place-items-center sm:h-80 sm:w-80">
          {h.ring_text?.trim() && <RingText key={isRTL ? 'rtl' : 'ltr'} text={h.ring_text} rtl={isRTL} />}
          <div className="hex-clip-v absolute inset-10 bg-gradient-to-br from-gold via-gold-dark to-gold-light p-[2px]">
            <div className="hex-clip-v h-full w-full bg-gradient-to-br from-emerald-mid to-emerald-ink" />
          </div>
          <div className="relative text-center">
            <Counter to={Number(h.counter_value) || 0} suffix={h.counter_suffix} className="text-gold-gradient block font-[family-name:var(--font-montserrat)] text-7xl font-black" />
            <span className="mt-1 block text-sm font-bold tracking-wider text-gold-light">{h.counter_label}</span>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="text-3xl leading-tight font-black text-balance sm:text-4xl lg:text-5xl">
              {h.title_prefix && <span className="text-gold-gradient">{h.title_prefix} </span>}
              {h.title}
            </h2>
          </Reveal>
          {h.description && (
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-2xl text-lg whitespace-pre-line text-white/65">{h.description}</p>
            </Reveal>
          )}
          {stats.length > 0 && (
            <Stagger className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4" gap={0.12}>
              {stats.map((s, i) => (
                <StaggerItem key={i}>
                  <GlassCard className="h-full p-6 hover:-translate-y-1.5">
                    <Counter
                      to={Number(s.value) || 0}
                      suffix={s.suffix}
                      className="relative z-10 block font-[family-name:var(--font-montserrat)] text-4xl font-black text-gold"
                    />
                    <span className="relative z-10 mt-2 block text-sm font-semibold text-white/70">{s.label}</span>
                  </GlassCard>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}
