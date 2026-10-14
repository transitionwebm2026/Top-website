'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

// Opacity and movement only: a blur filter on whole sections costs phones a repaint every frame.
export const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/** Single element that fades/slides in when scrolled into view. */
export function Reveal({ children, delay = 0, y = 36, className, as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Parent that staggers its <StaggerItem> children on scroll. */
export function Stagger({ children, className, gap = 0.1, delay = 0, as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={fadeUp} {...rest}>
      {children}
    </Tag>
  );
}
