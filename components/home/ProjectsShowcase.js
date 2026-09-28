'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';

import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Expanding-panel carousel: the active card widens (accordion feel) inside a
 * horizontally scrollable, drag-friendly track.
 * `content` = `key_projects` heading; `projects` from partners_and_projects.
 */
export default function ProjectsShowcase({ content, projects = [] }) {
  const { t, pick, isRTL } = useLang();
  const [active, setActive] = useState(0);
  const track = useRef(null);

  const scroll = (dirSign) => {
    const el = track.current;
    if (!el) return;
    // In RTL, scrollLeft grows negative, so the physical direction flips.
    el.scrollBy({ left: dirSign * (isRTL ? -1 : 1) * 340, behavior: 'smooth' });
  };

  // Drag-to-scroll for mouse users
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onDown = (e) => {
    drag.current = { down: true, x: e.pageX, left: track.current.scrollLeft, moved: false };
  };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const dx = e.pageX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    track.current.scrollLeft = drag.current.left - dx;
  };
  const onUp = () => (drag.current.down = false);

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;
  const heading = pick(content);
  if (!heading || !projects.length) return null;

  return (
    <section className="relative py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-end justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
        <SectionHeading align="start" eyebrow={heading.eyebrow} title={heading.title} />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/45 sm:block">{heading.hint}</span>
          {[
            [Prev, -1, t.common.prev],
            [Next, 1, t.common.next],
          ].map(([Icon, s, k]) => (
            <button
              key={k}
              onClick={() => scroll(s)}
              aria-label={k}
              className="glass grid h-12 w-12 place-items-center rounded-full text-gold transition hover:scale-110 hover:bg-gold hover:text-emerald-ink"
            >
              <Icon size={22} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        className="no-scrollbar mt-12 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-6 select-none active:cursor-grabbing sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {projects.map((p, i) => {
          const isActive = i === active;
          return (
            <motion.article
              key={p.id}
              layout
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => !drag.current.moved && setActive(i)}
              tabIndex={0}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ layout: { type: 'spring', stiffness: 200, damping: 28 }, delay: i * 0.05, duration: 0.6 }}
              className={`glass group relative h-[430px] shrink-0 snap-start overflow-hidden rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isActive ? 'w-[88vw] sm:w-[440px]' : 'w-[70vw] sm:w-[220px]'
              }`}
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt={pick(p.name)}
                  fill
                  draggable={false}
                  sizes="440px"
                  className={`object-cover transition duration-700 ${isActive ? 'scale-100 opacity-90' : 'scale-110 opacity-55 grayscale-[40%]'}`}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-mid via-emerald-deep to-emerald-ink">
                  <Anchor size={110} strokeWidth={1} className="text-gold/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-ink via-emerald-ink/50 to-transparent" />
              <span className="absolute top-5 start-5 grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-emerald-ink/60 font-[family-name:var(--font-montserrat)] font-bold text-gold backdrop-blur">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <motion.span
                  layout="position"
                  className="mb-3 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold-light ring-1 ring-gold/30"
                >
                  {pick(p.type)}
                </motion.span>
                <motion.h3 layout="position" className={`font-extrabold text-balance ${isActive ? 'text-2xl' : 'text-lg'}`}>
                  {pick(p.name)}
                </motion.h3>
                <motion.p
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0, height: isActive ? 'auto' : 0 }}
                  className="flex items-center gap-1.5 overflow-hidden text-sm text-white/70"
                >
                  <MapPin size={14} className="mt-2 text-gold" />
                  <span className="mt-2">{pick(p.place)}</span>
                </motion.p>
              </div>
              <span
                className={`absolute inset-x-6 bottom-0 h-[3px] origin-center rounded-full bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-700 ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
