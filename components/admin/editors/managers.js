'use client';

// Ready-made collection managers shared by several page editors.

import { DOC_TYPES, documentFields, partnerFields, projectFields } from '@/lib/admin/collections';
import CollectionManager, { Muted } from '../CollectionManager';
import { Badge } from '../ui';

const other = (lang) => (lang === 'ar' ? 'en' : 'ar');
const pickCol = (r, col, lang) => r[`${col}_${lang}`] || r[`${col}_${other(lang)}`];

export function PartnersManager() {
  return (
    <CollectionManager
      table="partners_and_projects"
      eq={{ kind: 'partner' }}
      title={{ en: 'Partner logos', ar: 'شعارات الشركاء' }}
      description={{
        en: 'Shown in the logo wall on the home page; a logo with a website links to it.',
        ar: 'تظهر في شبكة الشعارات بالصفحة الرئيسية، ويفتح الشعار موقع الشريك إن وُجد.',
      }}
      noun={{ en: 'partner', ar: 'شريك' }}
      fields={partnerFields}
      imageField="image_url"
      context={{ folder: 'partners' }}
      columns={[{ key: 'site', render: (r) => r.website_url && <Muted>{r.website_url.replace(/^https?:\/\//, '')}</Muted> }]}
    />
  );
}

export function ProjectsManager() {
  return (
    <CollectionManager
      table="partners_and_projects"
      eq={{ kind: 'project' }}
      title={{ en: 'Key projects', ar: 'أهم المشاريع' }}
      description={{ en: 'Reference projects in the home page carousel.', ar: 'المشاريع المرجعية في عارض الصفحة الرئيسية.' }}
      noun={{ en: 'project', ar: 'مشروع' }}
      fields={projectFields}
      imageField="image_url"
      context={{ folder: 'projects' }}
      columns={[
        { key: 'location', render: (r, lang) => <Muted>{pickCol(r, 'location', lang)}</Muted> },
        { key: 'type', render: (r, lang) => pickCol(r, 'category', lang) && <Badge>{pickCol(r, 'category', lang)}</Badge> },
      ]}
    />
  );
}

export function DocumentsManager() {
  return (
    <CollectionManager
      table="company_documents"
      title={{ en: 'Legal documents', ar: 'المستندات الرسمية' }}
      description={{
        en: 'Official registrations and approval certificates shown in the About page gallery (image preview + optional PDF, which opens in the page-turning viewer). A certificate whose title has a badge code (e.g. “UL …”) gets that seal.',
        ar: 'المستندات الرسمية وشهادات الاعتماد المعروضة في صفحة من نحن (صورة للمعاينة + ملف PDF اختياري يُفتح في عارض تقليب الصفحات). الشهادة التي يحتوي عنوانها على رمز شارة (مثل «UL …») يظهر عليها ختمها.',
      }}
      noun={{ en: 'document', ar: 'مستند' }}
      fields={documentFields}
      defaults={{ doc_type: 'other', is_published: true }}
      imageField="image_url"
      context={{ folder: 'documents' }}
      columns={[
        { key: 'type', render: (r, lang, tr) => <Badge tone="gold">{tr(DOC_TYPES.find((d) => d.value === r.doc_type)?.label) || r.doc_type}</Badge> },
        { key: 'pdf', render: (r) => r.file_url && <Badge tone="blue">PDF</Badge> },
      ]}
    />
  );
}
