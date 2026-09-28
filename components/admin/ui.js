'use client';

// Dashboard design primitives: dark liquid-glass surfaces in the TOP POWER
// palette (emerald #153726 / #215733, gold #CDB074).
// Text props accept plain strings or `{ en, ar }` objects (resolved with tr()).

import Link from 'next/link';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useAdmin } from './AdminContext';

export const cx = (...c) => c.filter(Boolean).join(' ');

// ---------------------------------------------------------------- buttons
const BTN = {
  primary:
    'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-emerald-ink shadow-[0_8px_24px_-10px_rgba(205,176,116,0.8)] hover:brightness-110',
  secondary: 'border border-gold/25 bg-white/[0.04] text-gold-light hover:border-gold/60 hover:bg-gold/10',
  ghost: 'text-white/70 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-red-400/30 bg-red-500/10 text-red-200 hover:border-red-400/70 hover:bg-red-500/20',
};
const SIZE = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-sm gap-2' };

export const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon: Icon, href, external, className, children, disabled, ...rest },
  ref,
) {
  const cls = cx(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
    BTN[variant],
    SIZE[size],
    className,
  );
  const inner = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={size === 'sm' ? 14 : 16} /> : null}
      {children}
    </>
  );
  if (href) {
    return external ? (
      <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {inner}
      </a>
    ) : (
      <Link ref={ref} href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type="button" className={cls} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
});

export function IconButton({ icon: Icon, label, className, variant = 'ghost', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition disabled:opacity-30', BTN[variant], className)}
      {...rest}
    >
      <Icon size={15} />
    </button>
  );
}

// ------------------------------------------------------------------ surfaces
export function Card({ className, children, ...rest }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-gold/15 bg-gradient-to-br from-emerald-deep/50 to-emerald-ink/70 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions, className }) {
  const { tr } = useAdmin();
  title = tr(title);
  description = tr(description);
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-3 border-b border-gold/10 px-5 py-4', className)}>
      <div className="min-w-0">
        <h3 className="font-bold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-white/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, icon: Icon }) {
  const { tr } = useAdmin();
  title = tr(title);
  description = tr(description);
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark text-emerald-ink shadow-[0_0_24px_-6px_rgba(205,176,116,0.7)]">
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-white/55">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// --------------------------------------------------------------------- tabs
export function Tabs({ tabs, value, onChange, className }) {
  const { tr } = useAdmin();
  return (
    <div className={cx('no-scrollbar -mx-1 mb-6 flex gap-1 overflow-x-auto px-1', className)} role="tablist">
      <div className="flex gap-1 rounded-2xl border border-gold/15 bg-emerald-ink/50 p-1">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={cx(
                'relative isolate flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                active ? 'text-emerald-ink' : 'text-white/65 hover:text-gold-light',
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-gold-light to-gold"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              {t.icon && <t.icon size={15} />}
              {tr(t.label)}
              {t.badge != null && t.badge !== 0 && (
                <span className={cx('rounded-full px-1.5 text-[0.65rem] font-bold', active ? 'bg-emerald-ink/20' : 'bg-gold/20 text-gold')}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- inputs
export const inputCls =
  'w-full rounded-xl border border-white/10 bg-emerald-ink/60 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-gold/60 focus:ring-2 focus:ring-gold/15 disabled:opacity-60';

export const Input = forwardRef(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx(inputCls, className)} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cx(inputCls, 'resize-y leading-relaxed', className)} {...rest} />;
});

export function Select({ className, children, ...rest }) {
  return (
    <div className="relative">
      <select className={cx(inputCls, 'cursor-pointer appearance-none pe-9', className)} {...rest}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-white/40" />
    </div>
  );
}

export function Label({ children, htmlFor, required, className }) {
  const { tr } = useAdmin();
  return (
    <label htmlFor={htmlFor} className={cx('mb-1.5 block text-xs font-semibold text-white/60 ltr:tracking-wide', className)}>
      {tr(children)}
      {required && <span className="ms-0.5 text-gold">*</span>}
    </label>
  );
}

export function Help({ children }) {
  const { tr } = useAdmin();
  return children ? <p className="mt-1.5 text-xs text-white/40">{tr(children)}</p> : null;
}

/** Small language chip used on bilingual inputs. */
export function LangChip({ lang }) {
  return (
    <span
      className={cx(
        'rounded-md px-1.5 py-0.5 font-[family-name:var(--font-montserrat)] text-[0.6rem] font-bold tracking-wider',
        lang === 'ar' ? 'bg-gold/15 text-gold' : 'bg-white/10 text-white/70',
      )}
    >
      {lang === 'ar' ? 'AR · ع' : 'EN'}
    </span>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  const { tr } = useAdmin();
  label = tr(label);
  description = tr(description);
  return (
    <label className={cx('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-50')}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition',
          checked ? 'border-gold/70 bg-gradient-to-r from-gold-dark to-gold' : 'border-white/15 bg-white/10',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 34 }}
          className={cx('absolute top-0.5 h-[18px] w-[18px] rounded-full shadow', checked ? 'end-0.5 bg-emerald-ink' : 'start-0.5 bg-white/80')}
        />
      </button>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-white/85">{label}</span>}
          {description && <span className="block text-xs text-white/45">{description}</span>}
        </span>
      )}
    </label>
  );
}

// ------------------------------------------------------------------ misc UI
export function Badge({ tone = 'neutral', children, className }) {
  const tones = {
    neutral: 'bg-white/[0.07] text-white/70 ring-white/10',
    gold: 'bg-gold/15 text-gold-light ring-gold/30',
    green: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30',
    red: 'bg-red-500/10 text-red-300 ring-red-400/30',
    blue: 'bg-sky-400/10 text-sky-300 ring-sky-400/30',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-bold ring-1', tones[tone], className)}>{children}</span>;
}

export function Spinner({ label, className }) {
  const { t, tr } = useAdmin();
  return (
    <div className={cx('flex items-center justify-center gap-3 py-16 text-sm text-white/50', className)}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
      {label ? tr(label) : t('common.loading')}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  const { tr } = useAdmin();
  title = tr(title);
  description = tr(description);
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/20 bg-gold/5 text-gold">
          <Icon size={24} />
        </span>
      )}
      <p className="font-bold text-white/85">{title}</p>
      {description && <p className="max-w-sm text-sm text-white/45">{description}</p>}
      {action}
    </div>
  );
}

/** Error box. A string is looked up as a dictionary key (e.g. 'err.perm'); unknown text shows as-is. */
export function ErrorNote({ children }) {
  const { t } = useAdmin();
  if (!children) return null;
  return <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{typeof children === 'string' ? t(children) : children}</div>;
}
