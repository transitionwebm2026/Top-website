'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLang } from '@/components/providers/LanguageProvider';

/** Blurred-backdrop glass modal. `size`: 'md' | 'lg' | 'full'. */
export default function Modal({ open, onClose, children, size = 'lg', label }) {
  const { t, dir } = useLang();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const widths = {
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    full: 'max-w-6xl',
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          dir={dir}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-emerald-ink/70 backdrop-blur-xl" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`glass-strong relative w-full ${widths[size]} max-h-[92vh] overflow-y-auto rounded-[28px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] outline-none`}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <button
              onClick={onClose}
              aria-label={t.close}
              className="glass sticky top-4 z-20 float-end me-4 mt-4 grid h-11 w-11 place-items-center rounded-full text-gold transition hover:rotate-90 hover:bg-gold hover:text-emerald-ink"
            >
              <X size={20} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
