'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MotionLink = motion.create(Link);

const variants = {
  gold: 'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-emerald-ink shadow-[0_10px_40px_-10px_rgba(205,176,116,0.7)] hover:shadow-[0_14px_50px_-8px_rgba(205,176,116,0.95)]',
  glass: 'glass text-gold-light hover:border-gold/80 hover:shadow-[0_0_30px_-5px_rgba(205,176,116,0.45)]',
  whatsapp: 'bg-whatsapp text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,0.7)] hover:shadow-[0_14px_50px_-8px_rgba(37,211,102,0.9)]',
};

/** CTA button that is gently pulled toward the cursor. Renders a Link, <a> or <button>. */
export default function MagneticButton({ href, external, variant = 'gold', className = '', children, strength = 0.3, ...rest }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = `group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[0.95rem] font-bold transition-[box-shadow,border-color,background-color] duration-300 ${variants[variant]} ${className}`;
  const common = { ref, onMouseMove: onMove, onMouseLeave: reset, style: { x: sx, y: sy }, whileTap: { scale: 0.96 }, className: cls, ...rest };
  const inner = (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
    </>
  );

  if (!href) return <motion.button {...common}>{inner}</motion.button>;
  if (external) {
    return (
      <motion.a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...common}>
        {inner}
      </motion.a>
    );
  }
  return (
    <MotionLink href={href} {...common}>
      {inner}
    </MotionLink>
  );
}
