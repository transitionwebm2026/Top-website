'use client';

// Toasts, confirmation dialogs and the slide-over drawer used by every editor.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAdmin } from './AdminContext';
import { Button, cx } from './ui';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const { t, tr, dir } = useAdmin();
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const id = useRef(0);

  const dismiss = useCallback((tid) => setToasts((ts) => ts.filter((x) => x.id !== tid)), []);

  const toast = useCallback(
    (message, tone = 'success') => {
      const tid = ++id.current;
      setToasts((ts) => [...ts.slice(-3), { id: tid, message, tone }]);
      setTimeout(() => dismiss(tid), tone === 'error' ? 7000 : 3500);
    },
    [dismiss],
  );

  /** Error toast; known database errors (error.kind) are shown in the dashboard language. */
  const fail = useCallback((error) => toast(error?.kind ? t(`err.${error.kind}`) : error?.message || String(error), 'error'), [toast, t]);

  /** Promise-based confirm: `if (await confirm({ title, message })) …` */
  const confirm = useCallback((opts) => new Promise((resolve) => setConfirmState({ ...opts, resolve })), []);

  const close = (answer) => {
    confirmState?.resolve(answer);
    setConfirmState(null);
  };

  const icons = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <FeedbackContext.Provider value={{ toast, fail, confirm }}>
      {children}

      <div className="pointer-events-none fixed end-4 bottom-4 z-[200] flex w-[min(92vw,380px)] flex-col gap-2" dir={dir}>
        <AnimatePresence>
          {toasts.map((x) => {
            const Icon = icons[x.tone] || Info;
            return (
              <motion.div
                key={x.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: dir === 'rtl' ? -40 : 40 }}
                className={cx(
                  'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl',
                  x.tone === 'error' ? 'border-red-400/40 bg-red-950/85 text-red-100' : 'border-gold/30 bg-emerald-night/90 text-white',
                )}
                role="status"
              >
                <Icon size={18} className={x.tone === 'error' ? 'mt-0.5 shrink-0 text-red-300' : 'mt-0.5 shrink-0 text-gold'} />
                <p className="min-w-0 flex-1 leading-relaxed">{x.message}</p>
                <button onClick={() => dismiss(x.id)} aria-label={t('common.dismiss')} className="text-white/40 hover:text-white">
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={!!confirmState} onClose={() => close(false)} size="sm">
        {confirmState && (
          <div className="p-6">
            <div className="flex gap-4">
              <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', confirmState.danger ? 'bg-red-500/15 text-red-300' : 'bg-gold/15 text-gold')}>
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">{tr(confirmState.title)}</h3>
                {confirmState.message && <p className="mt-1.5 text-sm leading-relaxed text-white/60">{tr(confirmState.message)}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => close(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant={confirmState.danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
                {tr(confirmState.confirmLabel) || t('common.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return ctx;
}

/** Centered modal (size sm/md/lg) or a drawer sliding in from the inline end (`drawer`). */
export function Dialog({ open, onClose, children, size = 'md', drawer = false, title, footer }) {
  const { t, tr, dir, lang } = useAdmin();
  const panel = useRef(null);
  const from = dir === 'rtl' ? '-100%' : '100%';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  const heading = tr(title);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={cx('fixed inset-0 z-[150] flex', drawer ? 'justify-end' : 'items-center justify-center p-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={dir}
          lang={lang}
        >
          <div className="absolute inset-0 bg-emerald-ink/75 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={heading}
            tabIndex={-1}
            initial={drawer ? { x: from } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={drawer ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={drawer ? { x: from } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={cx(
              'relative flex flex-col border-gold/25 bg-gradient-to-b from-emerald-deep/95 to-emerald-ink/95 shadow-2xl outline-none backdrop-blur-2xl',
              drawer ? `h-full w-full ${widths[size]} border-s` : `max-h-[90vh] w-full ${widths[size]} rounded-3xl border`,
            )}
          >
            {heading && (
              <div className="flex items-center justify-between gap-3 border-b border-gold/15 px-6 py-4">
                <h2 className="truncate text-lg font-bold text-white">{heading}</h2>
                <button onClick={onClose} aria-label={t('common.close')} className="grid h-9 w-9 place-items-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-gold/15 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
