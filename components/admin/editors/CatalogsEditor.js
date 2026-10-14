'use client';

import { useCallback, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useTable, useUpload } from '@/lib/admin/hooks';
import { catalogFields } from '@/lib/admin/collections';
import { inspectPdf } from '@/lib/pdf';
import PageEditor from '../PageEditor';
import { useAdmin } from '../AdminContext';
import CollectionManager, { Muted } from '../CollectionManager';
import { slugify } from '../fields/Fields';
import { Badge } from '../ui';

// Covers made from a PDF's first page; one that is still in this folder is redone when the PDF is replaced.
const AUTO_COVERS = 'catalog-covers';

const formatSize = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

function CatalogsManager() {
  const { tr } = useAdmin();
  const { upload } = useUpload();
  const categories = useTable('product_categories', { select: 'id, name_ar, name_en, sort_order' });
  const lines = useMemo(
    () => categories.rows.map((c) => ({ value: c.id, label: { en: c.name_en || c.name_ar, ar: c.name_ar || c.name_en } })),
    [categories.rows],
  );

  /** Link name, page count, size and (when there is none) a cover, read from the PDF before saving. */
  const withPdfDetails = useCallback(
    async (payload, row, original) => {
      const next = { ...payload, slug: payload.slug || slugify(row.title_en || '') || `catalog-${Date.now()}` };
      const newFile = next.file_url !== original?.file_url;
      const makeCover = !next.cover_url || (newFile && next.cover_url === original?.cover_url && next.cover_url.includes(`/${AUTO_COVERS}/`));
      if (!newFile && !makeCover && original?.page_count) return next;

      let info;
      try {
        info = await inspectPdf(next.file_url, { cover: makeCover });
      } catch (err) {
        console.error('[catalogs] could not read', next.file_url, err);
        throw Object.assign(new Error(err.message), { kind: 'pdf' });
      }
      next.page_count = info.pages;
      next.file_size = info.bytes;
      if (info.cover) next.cover_url = await upload(new File([info.cover], `${next.slug}.jpg`, { type: 'image/jpeg' }), AUTO_COVERS);
      return next;
    },
    [upload],
  );

  return (
    <CollectionManager
      table="catalogs"
      title={{ en: 'Catalogs', ar: 'الكتالوجات' }}
      description={{
        en: 'PDF catalogs on the Catalog page and the product pages: visitors browse them as a book or download them.',
        ar: 'كتالوجات PDF في صفحة الكتالوج وصفحات المنتجات: يتصفحها الزائر ككتاب أو يحمّلها.',
      }}
      noun={{ en: 'catalog', ar: 'كتالوج' }}
      fields={catalogFields}
      imageField="cover_url"
      context={{ folder: 'catalogs', options: { category_id: lines } }}
      beforeSave={withPdfDetails}
      columns={[
        { key: 'line', render: (r) => r.category_id && <Badge tone="gold">{tr(lines.find((l) => l.value === r.category_id)?.label)}</Badge> },
        { key: 'brand', render: (r) => r.brand && <Badge>{r.brand}</Badge> },
        { key: 'pages', render: (r) => r.page_count && <Muted>{tr({ en: `${r.page_count} pages`, ar: `عدد الصفحات ${r.page_count}` })}</Muted> },
        { key: 'size', render: (r) => r.file_size && <Muted className="font-mono">{formatSize(r.file_size)}</Muted> },
      ]}
    />
  );
}

const TABS = [
  { id: 'catalogs', label: { en: 'Catalogs', ar: 'الكتالوجات' }, render: () => <CatalogsManager /> },
  { id: 'hero', label: { en: 'Page Hero', ar: 'واجهة الصفحة' }, sections: ['hero_section'], hideFields: ['badges'] },
  { id: 'library', label: { en: 'Library Heading', ar: 'عنوان المكتبة' }, sections: ['catalog_library'] },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function CatalogsEditor() {
  return (
    <PageEditor
      slug="catalogs"
      icon={BookOpen}
      title={{ en: 'Catalogs', ar: 'الكتالوجات' }}
      description={{ en: 'Upload PDF catalogs and edit the Catalog page.', ar: 'ارفع كتالوجات PDF وعدّل صفحة الكتالوج.' }}
      tabs={TABS}
    />
  );
}
