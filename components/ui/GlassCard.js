'use client';

import { forwardRef, useCallback } from 'react';

/**
 * Liquid-glass surface with a cursor-tracking spotlight and glowing border.
 * The spotlight is drawn by the `.spotlight` pseudo-elements in globals.css.
 */
const GlassCard = forwardRef(function GlassCard(
  { as: Tag = 'div', className = '', strong = false, synced = false, onMouseMove, children, ...rest },
  ref,
) {
  const handleMove = useCallback(
    (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
      onMouseMove?.(e);
    },
    [onMouseMove],
  );

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      className={`spotlight ${strong ? 'glass-strong' : 'glass'} ${synced ? 'is-synced' : ''} rounded-3xl transition-[transform,box-shadow] duration-500 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default GlassCard;
