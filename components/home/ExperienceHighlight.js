'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/components/providers/LanguageProvider';
import Counter from '@/components/ui/Counter';
import GlassCard from '@/components/ui/GlassCard';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

export default function ExperienceHighlight() {
  const { t } = useLang();
  const h = t.home;

  return (
    <section id="content" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[auto_1fr]">
        {/* Rotating hexagon badge */}
        <Reveal className="relative mx-auto grid h-72 w-72 place-items-center sm:h-80 sm:w-80">
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-0 text-gold/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          >
            <defs>
              <path id="circle" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
            </defs>
            <text className="fill-current font-[family-name:var(--font-montserrat)] text-[10.5px] font-semibold tracking-[0.3em]">
              <textPath href="#circle">FIRE SAFETY · MEP SOLUTIONS · UL · FM · NFPA · SINCE 20 YEARS ·</textPath>
            </text>
          </motion.svg>
          <div className="hex-clip-v absolute inset-10 bg-gradient-to-br from-gold via-gold-dark to-gold-light p-[2px]">
            <div className="hex-clip-v h-full w-full bg-gradient-to-br from-emerald-mid to-emerald-ink" />
          </div>
          <div className="relative text-center">
            <Counter to={15} suffix="+" className="text-gold-gradient block font-[family-name:var(--font-montserrat)] text-7xl font-black" />
            <span className="mt-1 block text-sm font-bold tracking-wider text-gold-light">{h.stats[0].label}</span>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="text-3xl leading-tight font-black text-balance sm:text-4xl lg:text-5xl">
              <span className="text-gold-gradient">15+ </span>
              {h.expTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg text-white/65">{h.expDesc}</p>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4" gap={0.12}>
            {h.stats.map((s) => (
              <StaggerItem key={s.label}>
                <GlassCard className="h-full p-6 hover:-translate-y-1.5">
                  <Counter
                    to={s.value}
                    suffix={s.suffix}
                    className="relative z-10 block font-[family-name:var(--font-montserrat)] text-4xl font-black text-gold"
                  />
                  <span className="relative z-10 mt-2 block text-sm font-semibold text-white/70">{s.label}</span>
                </GlassCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
