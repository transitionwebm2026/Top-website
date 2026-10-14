'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import MagneticButton from './MagneticButton';

function Hexagon({ className, style }) {
  return (
    <svg viewBox="0 0 100 115" className={className} style={style} aria-hidden>
      <polygon points="50,2 98,29 98,86 50,113 2,86 2,29" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Scroll parallax only where it stays smooth: wide screens with motion allowed.
 * On phones scroll-linked JavaScript lags behind the finger, so the hero stays put.
 */
function useParallax() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return on;
}

const delay = (s) => ({ animationDelay: `${+s.toFixed(2)}s` });

/**
 * Universal page hero: full-bleed parallax image, animated gradient overlay,
 * staggered title and two magnetic CTAs.
 *
 * `content` is the page's `hero_section` ({ ar, en }): title, title_highlight,
 * description, image, CTA labels/links and optional badges. `zoom`, `compact`
 * and `badges` are layout switches decided by each page.
 *
 * Entrances and loops are CSS (globals.css): they start with the first paint of
 * the static HTML and run on the compositor, so navigating to a page never waits
 * on JavaScript to show its hero.
 */
export default function Hero({ content, zoom = false, compact = false, badges = false }) {
  const { t, pick, isRTL } = useLang();
  const copy = pick(content);
  const ref = useRef(null);
  const parallax = useParallax();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const hexY1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const hexY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  if (!copy) return null;
  const lines = [
    { text: copy.title, gold: false },
    { text: copy.title_highlight, gold: true },
  ].filter((l) => l.text);
  const badgeList = badges ? (copy.badges || []).map((b) => b.label).filter(Boolean) : [];

  return (
    <section
      ref={ref}
      className={`relative isolate flex items-center overflow-hidden ${compact ? 'min-h-[78vh]' : 'min-h-[100svh]'} pt-32 pb-20`}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -z-20" style={parallax ? { y: bgY } : undefined}>
        <div className={`absolute inset-0 ${zoom ? 'animate-hero-zoom' : 'animate-hero-settle'}`}>
          {copy.image && (
            <Image src={copy.image} alt="" fill priority sizes="100vw" className={`object-cover object-center ${compact ? 'blur-[3px]' : ''}`} />
          )}
        </div>
      </motion.div>

      {/* Animated gradient overlay: a wide gradient slid across (still on phones) */}
      <div className="absolute inset-0 -z-10 bg-emerald-ink/75" />
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-80">
        <div
          className="absolute inset-y-0 left-0 w-[300%] md:animate-sheen"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(8,23,15,0.95) 0%, rgba(21,55,38,0.55) 35%, rgba(33,87,51,0.35) 55%, rgba(205,176,116,0.18) 75%, rgba(8,23,15,0.95) 100%)',
          }}
        />
      </div>
      <div className="grid-texture absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-emerald-ink to-transparent" />

      {/* Decorative parallax hexagons */}
      <motion.div style={parallax ? { y: hexY1 } : undefined} className="pointer-events-none absolute -end-16 top-24 -z-10 text-gold/25">
        <Hexagon className="h-72 w-64 animate-float" />
      </motion.div>
      <motion.div style={parallax ? { y: hexY2 } : undefined} className="pointer-events-none absolute start-[6%] bottom-24 -z-10 text-gold/15">
        <Hexagon className="h-40 w-36 animate-float" style={{ animationDelay: '-3s' }} />
      </motion.div>

      <motion.div style={parallax ? { y: contentY, opacity: fade } : undefined} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl leading-[1.2] font-black sm:text-5xl lg:text-7xl lg:leading-[1.12]">
            {lines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-2">
                <span className="block animate-rise-line" style={delay(0.1 + i * 0.12)}>
                  <span className={`block ${line.gold ? 'text-gold-gradient animate-shimmer' : ''}`}>{line.text}</span>
                </span>
              </span>
            ))}
          </h1>

          {copy.description && (
            <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-white/75 sm:text-xl" style={delay(0.3)}>
              {copy.description}
            </p>
          )}

          <div className="mt-10 flex animate-rise flex-wrap gap-4" style={delay(0.42)}>
            {copy.cta_primary_label && (
              <MagneticButton href={copy.cta_primary_href || '/contact'} variant="gold">
                {copy.cta_primary_label}
                <Arrow size={18} className="transition-transform group-hover:-translate-y-0.5" />
              </MagneticButton>
            )}
            {copy.cta_secondary_label && (
              <MagneticButton href={copy.cta_secondary_href || '/products'} variant="glass">
                {copy.cta_secondary_label}
              </MagneticButton>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating certification badges */}
      {badgeList.length > 0 && (
        <div className="pointer-events-none absolute end-6 bottom-48 hidden flex-col gap-4 lg:end-16 lg:flex">
          {badgeList.map((b, i) => (
            <div key={b} className="animate-slide-in" style={{ ...delay(0.55 + i * 0.12), '--slide-from': isRTL ? '-30px' : '30px' }}>
              <div
                className="glass flex animate-float items-center gap-3 rounded-2xl px-5 py-3.5"
                style={{ animationDelay: `${-i * 1.5}s` }}
              >
                <ShieldCheck className="text-gold" size={22} />
                <span className="font-[family-name:var(--font-montserrat)] font-bold tracking-wide text-gold-light">{b}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <a href="#content" aria-label={t.common.scroll} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/70">
        <ChevronDown size={28} className="animate-nudge" />
      </a>
    </section>
  );
}
