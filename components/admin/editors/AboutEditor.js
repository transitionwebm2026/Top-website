'use client';

import { Info } from 'lucide-react';
import PageEditor from '../PageEditor';
import { DocumentsManager } from './managers';

const TABS = [
  { id: 'hero', label: { en: 'Hero', ar: 'الواجهة' }, sections: ['hero_section'], hideFields: ['badges'] },
  { id: 'history', label: { en: 'Company History & Vision', ar: 'تاريخ الشركة والرؤية' }, sections: ['company_history', 'mission_vision'] },
  { id: 'certs', label: { en: 'Certifications Badges', ar: 'شارات الاعتمادات' }, sections: ['certifications'] },
  { id: 'docs', label: { en: 'Legal Documents', ar: 'المستندات الرسمية' }, sections: ['legal_docs'], render: () => <DocumentsManager /> },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function AboutEditor() {
  return (
    <PageEditor
      slug="about_us"
      icon={Info}
      title={{ en: 'About Us', ar: 'من نحن' }}
      description={{ en: 'Story, timeline, mission, certifications and legal documents.', ar: 'القصة، الخط الزمني، الرسالة، الاعتمادات والمستندات الرسمية.' }}
      tabs={TABS}
    />
  );
}
