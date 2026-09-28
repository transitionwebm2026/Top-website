'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import SectionHeading from '@/components/ui/SectionHeading';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import ArticleBody from './ArticleBody';

function useFormatDate() {
  const { lang } = useLang();
  return (d) => new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Meta({ a }) {
  const { t } = useLang();
  const fmt = useFormatDate();
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
      <span className="flex items-center gap-1.5">
        <CalendarDays size={15} className="text-gold" />
        {fmt(a.date)}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock size={15} className="text-gold" />
        {a.readTime} {t.blog.minRead}
      </span>
    </div>
  );
}

function ArticleModal({ article, onClose }) {
  const { pick } = useLang();
  return (
    <Modal open={!!article} onClose={onClose} size="md" label={article ? pick(article.title) : ''}>
      {article && (
        <article>
          <div className="relative -mt-[3.75rem] h-64 overflow-hidden rounded-t-[28px] sm:h-80">
            <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0">
              {article.image && <Image src={article.image} alt="" fill sizes="700px" className="object-cover" />}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/40 to-transparent" />
          </div>
          <div className="px-6 pb-10 sm:px-12">
            <span className="-mt-5 relative inline-block rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-emerald-ink">
              {pick(article.category)}
            </span>
            <h2 className="mt-5 text-2xl leading-snug font-black sm:text-3xl">{pick(article.title)}</h2>
            <div className="mt-4 border-b border-gold/15 pb-6">
              <Meta a={article} />
            </div>
            <div className="mt-6">
              <ArticleBody markdown={pick(article.body)} />
            </div>
          </div>
        </article>
      )}
    </Modal>
  );
}

/**
 * Blog listing: one hero article (display = 'hero') plus the grid.
 * `articles` = published blogs (newest first); `gridHeading` = `blog_grid` section.
 */
export default function BlogView({ articles = [], gridHeading }) {
  const { t, pick, isRTL } = useLang();
  const [open, setOpen] = useState(null);
  // Fall back to the newest article when none is marked as hero.
  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a !== featured);
  const heading = pick(gridHeading);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  if (!featured) {
    return (
      <section id="content" className="px-4 py-24 text-center text-white/60">
        {t.blog.empty}
      </section>
    );
  }

  return (
    <section id="content" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Featured: wide asymmetric split. Image sits on the start side (right in Arabic). */}
        <Reveal>
          <GlassCard strong className="group grid overflow-hidden p-3 lg:grid-cols-[1.25fr_1fr]">
            <button onClick={() => setOpen(featured)} className="relative z-10 block h-72 overflow-hidden rounded-[20px] sm:h-96 lg:h-[480px]" aria-label={pick(featured.title)}>
              {featured.image && (
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width:1024px) 95vw, 700px"
                  className="object-cover transition duration-[1.2s] group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-ink/70 to-transparent" />
              <span className="absolute top-5 start-5 rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-emerald-ink">{t.blog.featured}</span>
            </button>
            <div className="relative z-10 flex flex-col justify-center gap-5 p-6 sm:p-10">
              <span className="text-sm font-bold tracking-wider text-gold">{pick(featured.category)}</span>
              <h2 className="text-2xl leading-snug font-black sm:text-3xl lg:text-4xl">{pick(featured.title)}</h2>
              <p className="leading-relaxed text-white/65">{pick(featured.excerpt)}</p>
              <Meta a={featured} />
              <button
                onClick={() => setOpen(featured)}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-br from-gold-light to-gold-dark px-7 py-3.5 font-bold text-emerald-ink shadow-[0_10px_30px_-10px_rgba(205,176,116,0.8)] transition hover:scale-105"
              >
                {t.blog.readFull}
                <Arrow size={18} />
              </button>
            </div>
          </GlassCard>
        </Reveal>

        {rest.length > 0 && heading && <SectionHeading className="mt-24" eyebrow={heading.eyebrow} title={heading.title} desc={heading.description} />}

        {/* 3x2 staggered grid — middle column is offset for rhythm */}
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {rest.map((a, i) => (
            <StaggerItem key={a.id} className={i % 3 === 1 ? 'lg:translate-y-10' : ''}>
              <GlassCard as="article" className="group flex h-full flex-col overflow-hidden p-3 hover:-translate-y-2">
                <button onClick={() => setOpen(a)} className="relative z-10 block h-52 overflow-hidden rounded-2xl bg-white" aria-label={pick(a.title)}>
                  {a.image && (
                    <Image
                      src={a.image}
                      alt=""
                      fill
                      sizes="(max-width:768px) 95vw, 400px"
                      className="object-cover object-top transition duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                  )}
                  <span className="absolute top-3 start-3 rounded-full bg-emerald-deep/90 px-3 py-1 text-xs font-bold text-gold backdrop-blur">
                    {pick(a.category)}
                  </span>
                </button>
                <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
                  <Meta a={a} />
                  <h3 className="text-lg leading-snug font-extrabold">{pick(a.title)}</h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-white/60">{pick(a.excerpt)}</p>
                  <button
                    onClick={() => setOpen(a)}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-bold text-gold transition hover:gap-3"
                  >
                    {t.blog.read}
                    <Arrow size={16} />
                  </button>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <ArticleModal article={open} onClose={() => setOpen(null)} />
    </section>
  );
}
