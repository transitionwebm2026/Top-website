'use client';

/* eslint-disable @next/next/no-img-element */

import { Home, LayoutGrid } from 'lucide-react';
import { useTable } from '@/lib/admin/hooks';
import PageEditor from '../PageEditor';
import { useAdmin } from '../AdminContext';
import { useFeedback } from '../feedback';
import { Button, Card, CardHeader, Spinner, Toggle } from '../ui';
import { PartnersManager, ProjectsManager } from './managers';

/** Which product categories appear in the home bento grid. */
function BentoCategories() {
  const { lang, tr } = useAdmin();
  const { fail } = useFeedback();
  const { rows, loading, patch } = useTable('product_categories', { select: 'id, slug, name_ar, name_en, cover_image, show_on_home, is_published, sort_order' });

  const toggle = async (r, v) => {
    try {
      await patch(r.id, { show_on_home: v });
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Card>
      <CardHeader
        title={{ en: 'Categories in the grid', ar: 'التصنيفات في الشبكة' }}
        description={{
          en: 'Toggle which product lines appear on the home page. Order and content are managed in Market / Products.',
          ar: 'اختر خطوط المنتجات التي تظهر في الصفحة الرئيسية. الترتيب والمحتوى من قسم السوق والمنتجات.',
        }}
        actions={
          <Button size="sm" icon={LayoutGrid} href="/admin/products">
            {tr({ en: 'Manage products', ar: 'إدارة المنتجات' })}
          </Button>
        }
      />
      {loading ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-white/5">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/95">
                {r.cover_image && <img src={r.cover_image} alt="" className="h-full w-full object-contain" />}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-white/85">{r[`name_${lang}`] || r.name_en}</span>
              {!r.is_published && <span className="text-xs text-red-300">{tr({ en: 'unpublished', ar: 'غير منشور' })}</span>}
              <Toggle checked={r.show_on_home} onChange={(v) => toggle(r, v)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const TABS = [
  { id: 'hero', label: { en: 'Hero Section', ar: 'الواجهة الرئيسية' }, sections: ['hero_section'] },
  { id: 'about', label: { en: 'About Summary', ar: 'نبذة عن الشركة' }, sections: ['about_summary'] },
  { id: 'bento', label: { en: 'Product Bento Grid', ar: 'شبكة المنتجات' }, sections: ['bento_grid'], render: () => <BentoCategories /> },
  { id: 'partners', label: { en: 'Partners Marquee', ar: 'شريط الشركاء' }, sections: ['partners_marquee'], render: () => <PartnersManager /> },
  { id: 'projects', label: { en: 'Key Projects', ar: 'أهم المشاريع' }, sections: ['key_projects'], render: () => <ProjectsManager /> },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function HomeEditor() {
  return (
    <PageEditor
      slug="home"
      icon={Home}
      title={{ en: 'Home Page', ar: 'الصفحة الرئيسية' }}
      description={{ en: 'Hero, company summary, product grid, partners and projects.', ar: 'الواجهة، نبذة الشركة، شبكة المنتجات، الشركاء والمشاريع.' }}
      tabs={TABS}
    />
  );
}
