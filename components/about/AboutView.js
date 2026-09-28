'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileDown, Maximize2, ShieldCheck, Target, ZoomIn, ZoomOut } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import SectionHeading from '@/components/ui/SectionHeading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

/** `content` = `company_history` section: heading, image, badge, timeline[]. */
function Timeline({ content }) {
  const { pick } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const c = pick(content);
  if (!c) return null;

  return (
    <section id="content" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Sticky storytelling image with overlapping layers */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading align="start" eyebrow={c.eyebrow} title={c.title} />
          {c.image && (
            <Reveal delay={0.2} className="relative mt-10">
              <div className="absolute -inset-3 -rotate-3 rounded-[32px] border border-gold/30" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
                <Image src={c.image} alt="" fill sizes="(max-width:1024px) 90vw, 520px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-ink/80 to-transparent" />
              </div>
              {c.badge_value && (
                <div className="glass absolute -bottom-6 end-4 flex animate-float items-center gap-3 rounded-2xl px-5 py-4 sm:-end-6">
                  <span className="text-gold-gradient font-[family-name:var(--font-montserrat)] text-4xl font-black">{c.badge_value}</span>
                  <span className="text-sm leading-tight font-semibold text-white/80">
                    {c.badge_line1}
                    <br />
                    {c.badge_line2}
                  </span>
                </div>
              )}
            </Reveal>
          )}
        </div>

        <div ref={ref} className="relative ps-10">
          <div className="absolute inset-y-0 start-3 w-px bg-gold/15" />
          <motion.div style={{ scaleY: lineScale }} className="absolute inset-y-0 start-3 w-px origin-top bg-gradient-to-b from-gold via-gold-light to-gold" />
          <div className="flex flex-col gap-8">
            {(c.timeline || []).map((step, i) => (
              <Reveal key={i} delay={0.05}>
                <div className="relative">
                  <span className="absolute -start-[2.2rem] top-7 grid h-5 w-5 place-items-center rounded-full border-2 border-gold bg-emerald-ink">
                    <span className="h-2 w-2 rounded-full bg-gold" />
                  </span>
                  <GlassCard className="p-7 hover:-translate-y-1">
                    <span className="relative z-10 font-[family-name:var(--font-montserrat)] text-sm font-bold tracking-widest text-gold uppercase">
                      {String(i + 1).padStart(2, '0')} · {step.year}
                    </span>
                    <h3 className="relative z-10 mt-2 text-xl font-extrabold sm:text-2xl">{step.title}</h3>
                    <p className="relative z-10 mt-3 leading-relaxed text-white/65">{step.text}</p>
                  </GlassCard>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** `content` = `certifications` section: heading + items[{ code, name, desc }]. */
function Certifications({ content }) {
  const { pick } = useLang();
  const c = pick(content);
  if (!c || !c.items?.length) return null;
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} />
        <Stagger className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6" gap={0.08}>
          {c.items.map((item, i) => (
            <StaggerItem key={`${item.code}-${i}`}>
              <motion.div whileHover={{ y: -8, rotate: i % 2 ? 2 : -2 }} className="animate-float" style={{ animationDelay: `${-i * 0.8}s` }}>
                <GlassCard className="flex h-full flex-col items-center p-6 text-center">
                  <div className="hex-clip-v relative z-10 grid h-24 w-[5.4rem] place-items-center bg-gradient-to-br from-gold-light via-gold to-gold-dark">
                    <div className="hex-clip-v grid h-[5.6rem] w-[5rem] place-items-center bg-emerald-deep">
                      <span className="font-[family-name:var(--font-montserrat)] text-xl font-black text-gold">{item.code}</span>
                    </div>
                  </div>
                  <h3 className="relative z-10 mt-4 font-bold">{item.name}</h3>
                  <p className="relative z-10 mt-1 text-xs leading-relaxed text-white/55">{item.desc}</p>
                </GlassCard>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/** `content` = `mission_vision` section: heading, card titles, mission[] and goals[]. */
function MissionGoals({ content }) {
  const { pick } = useLang();
  const c = pick(content);
  if (!c) return null;
  const blocks = [
    { title: c.mission_title, icon: ShieldCheck, items: c.mission || [], offset: '' },
    { title: c.goals_title, icon: Target, items: c.goals || [], offset: 'lg:mt-24' },
  ].filter((b) => b.items.length);
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} />
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {blocks.map(({ title, icon: Icon, items, offset }, bi) => (
            <Reveal key={title} delay={bi * 0.15} className={offset}>
              <GlassCard strong className="p-8 sm:p-10">
                <div className="relative z-10 flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark text-emerald-ink shadow-[0_0_30px_-5px_rgba(205,176,116,0.6)]">
                    <Icon size={26} />
                  </span>
                  <h3 className="text-2xl font-black">{title}</h3>
                </div>
                <Stagger className="relative z-10 mt-8 flex flex-col gap-4" gap={0.12}>
                  {items.map((it, i) => (
                    <StaggerItem key={i} className="flex gap-4 rounded-2xl border border-gold/10 bg-white/[0.03] p-5">
                      <span className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                      <p className="leading-relaxed text-white/80">{it.text}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** `content` = `legal_docs` heading; `documents` = company_documents (image preview + optional PDF). */
function DocumentsGallery({ content, documents }) {
  const { pick } = useLang();
  const [active, setActive] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const c = pick(content);
  const viewable = documents.filter((d) => d.image);
  if (!c || !documents.length) return null;

  const open = (d) => {
    // PDF-only documents open the file directly.
    if (!d.image) return window.open(d.file, '_blank', 'noopener');
    setZoomed(false);
    setActive(d);
  };
  const onImgClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
    setZoomed((z) => !z);
  };

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} desc={c.description} />
        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          {documents.map((d, i) => (
            <StaggerItem key={d.id} className={i % 2 ? 'lg:mt-12' : ''}>
              <GlassCard as="button" onClick={() => open(d)} className="group w-full p-4 text-start hover:-translate-y-2">
                <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                  {d.image ? (
                    <Image src={d.image} alt={pick(d.title)} fill sizes="(max-width:640px) 90vw, 320px" className="object-cover transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="grid h-full place-items-center bg-emerald-night text-gold">
                      <FileDown size={56} strokeWidth={1.2} />
                    </div>
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-emerald-ink/0 transition group-hover:bg-emerald-ink/50">
                    <Maximize2 className="scale-50 text-gold opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" size={34} />
                  </div>
                </div>
                <h3 className="relative z-10 mt-4 text-lg font-bold">{pick(d.title)}</h3>
                <p className="relative z-10 mt-1 text-sm text-white/55">{pick(d.desc)}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} size="full" label={active ? pick(active.title) : ''}>
        {active && (
          <div className="p-5 pt-2 sm:p-10 sm:pt-4">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-black">{pick(active.title)}</h3>
              <span className="flex items-center gap-1.5 text-sm text-white/50">
                {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                {c.zoom_hint}
              </span>
              {active.file && (
                <a
                  href={active.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-5 py-2.5 text-sm font-bold text-emerald-ink transition hover:scale-105"
                >
                  <FileDown size={16} /> {c.download_label}
                </a>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl bg-white">
              <motion.img
                src={active.image}
                alt={pick(active.title)}
                onClick={onImgClick}
                animate={{ scale: zoomed ? 2.2 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                style={{ transformOrigin: origin }}
                className={`block w-full ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              />
            </div>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {viewable.map((d) => (
                <button
                  key={d.id}
                  onClick={() => open(d)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    d.id === active.id ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  aria-label={pick(d.title)}
                >
                  <Image src={d.image} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

/** About page body. `sections` = the about_us page sections; `documents` = company_documents. */
export default function AboutView({ sections = {}, documents = [] }) {
  return (
    <>
      <Timeline content={sections.company_history} />
      <Certifications content={sections.certifications} />
      <MissionGoals content={sections.mission_vision} />
      <DocumentsGallery content={sections.legal_docs} documents={documents} />
    </>
  );
}
