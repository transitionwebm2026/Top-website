'use client';

import { Reveal } from './Reveal';

export default function SectionHeading({ eyebrow, title, desc, align = 'center', className = '' }) {
  const alignCls = align === 'center' ? 'text-center mx-auto items-center' : 'text-start items-start';
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignCls} ${className}`}>
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold" />
            {eyebrow}
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold" />
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="text-3xl leading-tight font-extrabold text-balance sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      </Reveal>
      {desc && (
        <Reveal delay={0.16}>
          <p className="text-base leading-relaxed text-white/65 sm:text-lg">{desc}</p>
        </Reveal>
      )}
    </div>
  );
}
