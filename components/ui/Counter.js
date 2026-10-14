'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';

/**
 * Counts up to `to` once scrolled into view. Each frame writes the number
 * straight into the DOM instead of re-rendering React ~130 times.
 */
export default function Counter({ to, duration = 2.2, suffix = '', className }) {
  const ref = useRef(null);
  const num = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    const node = num.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {/* Children never change, so React leaves the animated text alone. */}
      <span ref={num}>0</span>
      {suffix}
    </span>
  );
}
