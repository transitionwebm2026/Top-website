'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import MagneticButton from './MagneticButton';

const ease = [0.22, 1, 0.36, 1];

function Hexagon({ className, style }) {
  return (
    <svg viewBox="0 0 100 115" className={className} style={style} aria-hidden>
      <polygon points="50,2 98,29 98,86 50,113 2,86 2,29" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Universal page hero: full-bleed parallax image, animated gradient overlay,
 * staggered title and two magnetic CTAs.
 */
export default function Hero({ page, image, zoom = false, compact = false, badges = false }) {
  const { t, isRTL } = useLang();
  const copy = t.hero[page];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const hexY1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const hexY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  return (
    <section
      ref={ref}
      className={`relative isolate flex items-center overflow-hidden ${compact ? 'min-h-[78vh]' : 'min-h-[100svh]'} pt-32 pb-20`}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -z-20" style={{ y: bgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15 }}
          animate={{ scale: zoom ? [1.05, 1.15] : 1.05 }}
          transition={zoom ? { duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'linear' } : { duration: 1.6, ease }}
        >
          <Image src={image} alt="" fill priority sizes="100vw" className={`object-cover object-center ${compact ? "blur-[3px]" : ""}`} />
        </motion.div>
      </motion.div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-emerald-ink/75" />
      <motion.div
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(120deg, rgba(8,23,15,0.95) 0%, rgba(21,55,38,0.55) 35%, rgba(33,87,51,0.35) 55%, rgba(205,176,116,0.18) 75%, rgba(8,23,15,0.95) 100%)',
          backgroundSize: '300% 300%',
        }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />
      <div className="grid-texture absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-emerald-ink to-transparent" />

      {/* Decorative parallax hexagons */}
      <motion.div style={{ y: hexY1 }} className="pointer-events-none absolute -end-16 top-24 -z-10 text-gold/25">
        <Hexagon className="h-72 w-64 animate-float" />
      </motion.div>
      <motion.div style={{ y: hexY2 }} className="pointer-events-none absolute start-[6%] bottom-24 -z-10 text-gold/15">
        <Hexagon className="h-40 w-36 animate-float" style={{ animationDelay: '-3s' }} />
      </motion.div>

      <motion.div style={{ y: contentY, opacity: fade }} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl leading-[1.2] font-black sm:text-5xl lg:text-7xl lg:leading-[1.12]">
            {copy.title.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-2">
                <motion.span
                  className={`block ${i === 1 ? 'text-gold-gradient animate-shimmer' : ''}`}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.15, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl"
          >
            {copy.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticButton href="/contact" variant="gold">
              {t.cta.contact}
              <Arrow size={18} className="transition-transform group-hover:-translate-y-0.5" />
            </MagneticButton>
            <MagneticButton href="/products" variant="glass">
              {t.cta.explore}
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating certification badges */}
      {badges && (
        <div className="pointer-events-none absolute end-6 bottom-48 hidden flex-col gap-4 lg:end-16 lg:flex">
          {['UL Listed', 'FM Approved', 'NFPA'].map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.15, duration: 0.8, ease }}
            >
              <div
                className="glass flex animate-float items-center gap-3 rounded-2xl px-5 py-3.5"
                style={{ animationDelay: `${-i * 1.5}s` }}
              >
                <ShieldCheck className="text-gold" size={22} />
                <span className="font-[family-name:var(--font-montserrat)] font-bold tracking-wide text-gold-light">{b}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.a
        href="#content"
        aria-label="Scroll"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold/70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={28} />
      </motion.a>
    </section>
  );
}
