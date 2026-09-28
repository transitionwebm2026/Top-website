'use client';

import Link from 'next/link';
import { ArrowRight, FileBadge, FolderTree, Handshake, Image as ImageIcon, Inbox, Languages, Newspaper, Package, Palette, PenSquare, Plus } from 'lucide-react';
import { useCounts } from '@/lib/admin/hooks';
import { useAdmin } from '../AdminContext';
import { Card, CardHeader, PageHeader, cx } from '../ui';
import { Submissions } from './ContactEditor';

// Stat tiles: sentence-case label, value in the UI sans, icon as the only
// coloured element (values stay in text ink).
const STATS = [
  { key: 'products', label: { en: 'Product items', ar: 'المنتجات' }, icon: Package, href: '/admin/products', spec: { table: 'products' } },
  { key: 'categories', label: { en: 'Product categories', ar: 'تصنيفات المنتجات' }, icon: FolderTree, href: '/admin/products', spec: { table: 'product_categories' } },
  { key: 'blogs', label: { en: 'Published articles', ar: 'مقالات منشورة' }, icon: Newspaper, href: '/admin/blogs', spec: { table: 'blogs', eq: { status: 'published' } } },
  { key: 'drafts', label: { en: 'Draft articles', ar: 'مسودات المقالات' }, icon: PenSquare, href: '/admin/blogs', spec: { table: 'blogs', eq: { status: 'draft' } } },
  { key: 'documents', label: { en: 'Legal documents', ar: 'المستندات الرسمية' }, icon: FileBadge, href: '/admin/about', spec: { table: 'company_documents' } },
  { key: 'partners', label: { en: 'Partner brands', ar: 'العلامات الشريكة' }, icon: Handshake, href: '/admin/home', spec: { table: 'partners_and_projects', eq: { kind: 'partner' } } },
  { key: 'projects', label: { en: 'Key projects', ar: 'المشاريع' }, icon: ImageIcon, href: '/admin/home', spec: { table: 'partners_and_projects', eq: { kind: 'project' } } },
  { key: 'enquiries', label: { en: 'New enquiries', ar: 'استفسارات جديدة' }, icon: Inbox, href: '/admin/contact', spec: { table: 'contact_submissions', eq: { status: 'new' } } },
];
const SPECS = Object.fromEntries(STATS.map((s) => [s.key, s.spec]));

const QUICK = [
  { href: '/admin/blogs', label: { en: 'Write an article', ar: 'كتابة مقال' }, icon: Plus },
  { href: '/admin/products', label: { en: 'Add a product', ar: 'إضافة منتج' }, icon: Package },
  { href: '/admin/home', label: { en: 'Edit the home hero', ar: 'تعديل واجهة الرئيسية' }, icon: PenSquare },
  { href: '/admin/settings', label: { en: 'Contact buttons & social', ar: 'أزرار التواصل والسوشيال' }, icon: Palette },
  { href: '/admin/settings', label: { en: 'UI translations', ar: 'نصوص الواجهة' }, icon: Languages },
];

function StatTile({ label, value, icon: Icon, href, loading, highlight, locale }) {
  const compact = (n) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  return (
    <Link
      href={href}
      className={cx(
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-deep/50 to-emerald-ink/70 p-5 backdrop-blur-xl transition hover:-translate-y-0.5',
        highlight ? 'border-gold/50 shadow-[0_0_30px_-12px_rgba(205,176,116,0.8)]' : 'border-gold/15 hover:border-gold/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-white/60">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-white/10" /> : compact(value ?? 0)}</p>
      <ArrowRight
        size={15}
        className="absolute end-5 bottom-5 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-gold rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
      />
    </Link>
  );
}

export default function Overview() {
  const { profile, t, tr, lang, locale } = useAdmin();
  const { counts, loading } = useCounts(SPECS);
  const hour = new Date().getHours();
  const greeting = t(hour < 12 ? 'ov.morning' : hour < 18 ? 'ov.afternoon' : 'ov.evening');
  const name = profile?.full_name?.split(' ')[0] || '';

  return (
    <>
      <PageHeader title={name ? `${greeting}${lang === 'ar' ? '، ' : ', '}${name}` : greeting} description={t('ov.subtitle')} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatTile
            key={s.key}
            label={tr(s.label)}
            icon={s.icon}
            href={s.href}
            value={counts[s.key]}
            loading={loading}
            locale={locale}
            highlight={s.key === 'enquiries' && counts.enquiries > 0}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Submissions limit={5} />
        <Card className="h-fit">
          <CardHeader title={t('ov.quick')} />
          <ul className="p-2">
            {QUICK.map((q) => (
              <li key={q.label.en}>
                <Link href={q.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.05] hover:text-gold-light">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/10 text-gold">
                    <q.icon size={15} />
                  </span>
                  {tr(q.label)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
