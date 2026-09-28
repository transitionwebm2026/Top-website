'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/components/providers/LanguageProvider';
import Counter from '@/components/ui/Counter';
import GlassCard from '@/components/ui/GlassCard';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

/** Home "about summary": rotating hex counter + stats. `content` = `about_summary` section. */
export default function ExperienceHighlight({ content }) {
  const { pick } = useLang();
  const h = pick(content);
  if (!h) return null;
  const stats = h.stats || [];

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
              <textPath href="#circle">{h.ring_text}</textPath>
            </text>
          </motion.svg>
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
              <p className="mt-5 max-w-2xl text-lg text-white/65">{h.description}</p>
            </Reveal>
          )}
          {stats.length > 0 && (
            <Stagger className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4" gap={0.12}>
              {stats.map((s, i) => (
                <StaggerItem key={`${s.label}-${i}`}>
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
