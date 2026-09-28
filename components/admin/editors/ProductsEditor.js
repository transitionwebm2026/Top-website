'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useTable } from '@/lib/admin/hooks';
import { categoryFields, productFields } from '@/lib/admin/collections';
import PageEditor from '../PageEditor';
import { useAdmin } from '../AdminContext';
import CollectionManager, { Muted } from '../CollectionManager';
import { Badge, Label, Select, Spinner } from '../ui';

const count = (r) => (Array.isArray(r.products) ? r.products[0]?.count ?? 0 : 0);

function CategoriesManager() {
  return (
    <CollectionManager
      table="product_categories"
      select="*, products(count)"
      title={{ en: 'Product categories', ar: 'تصنيفات المنتجات' }}
      description={{ en: 'The main product lines. Each has its own page at /products/<slug>.', ar: 'خطوط المنتجات الرئيسية، ولكل تصنيف صفحة خاصة على /products/<slug>.' }}
      noun={{ en: 'category', ar: 'تصنيف' }}
      fields={categoryFields}
      titleField="name"
      imageField="cover_image"
      iconField="icon"
      defaults={{ icon: 'pipe', show_on_home: true, is_published: true }}
      context={{ folder: 'categories' }}
      columns={[
        { key: 'products', render: (r, lang, tr) => <Badge tone="gold">{tr({ en: `${count(r)} products`, ar: `${count(r)} منتج` })}</Badge> },
        { key: 'home', render: (r, lang, tr) => r.show_on_home && <Muted>{tr({ en: 'on home page', ar: 'في الرئيسية' })}</Muted> },
      ]}
    />
  );
}

function ProductsManager() {
  const { lang, tr } = useAdmin();
  const categories = useTable('product_categories', { select: 'id, slug, name_ar, name_en, sort_order' });
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (!categoryId && categories.rows.length) setCategoryId(categories.rows[0].id);
  }, [categories.rows, categoryId]);

  const options = useMemo(
    () => categories.rows.map((c) => ({ value: c.id, label: { en: c.name_en || c.name_ar, ar: c.name_ar || c.name_en } })),
    [categories.rows],
  );
  const current = categories.rows.find((c) => c.id === categoryId);

  if (categories.loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Label htmlFor="category-filter">{{ en: 'Category', ar: 'التصنيف' }}</Label>
          <Select id="category-filter" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {tr(o.label)}
              </option>
            ))}
          </Select>
        </div>
        {current && (
          <Muted className="pb-2.5 text-sm">
            {tr({ en: 'Products appear as tabs on', ar: 'تظهر المنتجات كتبويبات في' })} <span dir="ltr">/products/{current.slug}</span>
          </Muted>
        )}
      </div>

      {categoryId && (
        <CollectionManager
          key={categoryId}
          table="products"
          eq={{ category_id: categoryId }}
          title={{ en: 'Product items', ar: 'المنتجات' }}
          description={{ en: 'Sub-types with brands, shapes, sizes and datasheets.', ar: 'الأنواع الفرعية بعلاماتها وأشكالها ومقاساتها والداتاشيت.' }}
          noun={{ en: 'product', ar: 'منتج' }}
          fields={productFields}
          titleField="name"
          imageField="cover_image"
          iconField="icon"
          defaults={{ category_id: categoryId, icon: 'pipe', is_published: true }}
          context={{ folder: 'products', options: { category_id: options } }}
          columns={[
            { key: 'sizes', render: (r, l, t) => r.sizes?.length > 0 && <Muted>{t({ en: `${r.sizes.length} sizes`, ar: `${r.sizes.length} مقاس` })}</Muted> },
            { key: 'brands', render: (r, l) => r.brands?.length > 0 && <Badge>{r.brands.map((b) => b[`name_${l}`] || b.name_en).join(' · ')}</Badge> },
          ]}
        />
      )}
    </div>
  );
}

const TABS = [
  { id: 'categories', label: { en: 'Categories', ar: 'التصنيفات' }, render: () => <CategoriesManager /> },
  { id: 'products', label: { en: 'Product Items', ar: 'المنتجات' }, render: () => <ProductsManager /> },
  { id: 'hero', label: { en: 'Catalog Page Hero', ar: 'واجهة صفحة الكتالوج' }, sections: ['hero_section'], hideFields: ['badges'] },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function ProductsEditor() {
  return (
    <PageEditor
      slug="market"
      icon={ShoppingBag}
      title={{ en: 'Market / Products', ar: 'السوق والمنتجات' }}
      description={{ en: 'Product categories, product items and the catalog page.', ar: 'تصنيفات المنتجات، المنتجات وصفحة الكتالوج.' }}
      tabs={TABS}
    />
  );
}
