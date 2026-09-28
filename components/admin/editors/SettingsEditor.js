'use client';

import { useState } from 'react';
import { Globe, Languages, Link2, Palette, Phone, Settings, Share2, SlidersHorizontal } from 'lucide-react';
import { settingsGroups } from '@/lib/admin/collections';
import { useAdmin } from '../AdminContext';
import { PageHeader, Tabs } from '../ui';
import SettingsForm from './SettingsForm';
import TranslationsEditor from './TranslationsEditor';

const HEX = /^#[0-9a-f]{6}$/i;

/** Live preview of the brand colours before saving. */
function ThemePreview({ row }) {
  const { t } = useAdmin();
  const c = (v, d) => (HEX.test(v || '') ? v : d);
  const primary = c(row.color_primary, '#153726');
  const secondary = c(row.color_secondary, '#215733');
  const accent = c(row.color_accent, '#CDB074');
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10" style={{ background: `linear-gradient(135deg, ${secondary}, ${primary} 60%, #08170f)` }}>
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-xs font-bold ltr:tracking-[0.2em] ltr:uppercase" style={{ color: accent }}>
            {t('theme.preview')}
          </p>
          <p className="mt-1 text-xl font-black text-white">{t('theme.sampleTitle')}</p>
        </div>
        <span className="rounded-full px-5 py-2.5 text-sm font-bold" style={{ background: accent, color: primary }}>
          {t('theme.sampleButton')}
        </span>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'general', label: { en: 'General', ar: 'عام' }, icon: SlidersHorizontal },
  { id: 'nav', label: { en: 'Navbar & Footer', ar: 'القائمة والفوتر' }, icon: Link2 },
  { id: 'floating', label: { en: 'Floating Buttons', ar: 'الأزرار العائمة' }, icon: Phone },
  { id: 'social', label: { en: 'Social Media', ar: 'التواصل الاجتماعي' }, icon: Share2 },
  { id: 'branding', label: { en: 'Branding', ar: 'الهوية البصرية' }, icon: Palette },
  { id: 'seo', label: { en: 'SEO Defaults', ar: 'إعدادات SEO' }, icon: Globe },
  { id: 'i18n', label: { en: 'UI Translations', ar: 'نصوص الواجهة' }, icon: Languages },
];

export default function SettingsEditor() {
  const [tab, setTab] = useState('general');

  return (
    <>
      <PageHeader
        icon={Settings}
        title={{ en: 'Global Settings', ar: 'الإعدادات العامة' }}
        description={{ en: 'Navigation, contact buttons, social links, branding and site-wide text.', ar: 'القوائم، أزرار التواصل، روابط السوشيال، الهوية البصرية ونصوص الموقع.' }}
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'general' && (
        <SettingsForm
          fields={settingsGroups.general}
          title={{ en: 'Company & footer', ar: 'بيانات الشركة والفوتر' }}
          description={{ en: 'Names and registration details shown in the header and footer.', ar: 'الأسماء وبيانات التسجيل المعروضة في الهيدر والفوتر.' }}
        />
      )}
      {tab === 'nav' && (
        <SettingsForm
          fields={settingsGroups.navigation}
          title={{ en: 'Navigation links', ar: 'روابط التنقل' }}
          description={{ en: 'Menu items in the navbar and the footer quick links.', ar: 'عناصر القائمة العلوية وروابط الفوتر السريعة.' }}
        />
      )}
      {tab === 'floating' && (
        <SettingsForm
          fields={settingsGroups.floating}
          title={{ en: 'Floating action buttons', ar: 'الأزرار العائمة' }}
          description={{
            en: 'The WhatsApp and call buttons fixed to the corner of every page. Empty numbers hide the button.',
            ar: 'زرّا واتساب والاتصال الثابتان في ركن كل صفحة. ترك الرقم فارغاً يخفي الزر.',
          }}
        />
      )}
      {tab === 'social' && (
        <SettingsForm
          fields={settingsGroups.social}
          title={{ en: 'Social media', ar: 'التواصل الاجتماعي' }}
          description={{ en: 'Icons in the navbar and footer.', ar: 'الأيقونات في القائمة العلوية والفوتر.' }}
        />
      )}
      {tab === 'branding' && (
        <SettingsForm
          fields={settingsGroups.branding}
          title={{ en: 'Branding', ar: 'الهوية البصرية' }}
          description={{ en: 'Logos and theme colours (hex). Colour changes apply to the whole site.', ar: 'الشعارات وألوان الموقع (hex). تغيير الألوان يطبّق على الموقع كله.' }}
        >
          {(row) => <ThemePreview row={row} />}
        </SettingsForm>
      )}
      {tab === 'seo' && (
        <SettingsForm
          fields={settingsGroups.seo}
          title={{ en: 'SEO defaults', ar: 'إعدادات SEO الافتراضية' }}
          description={{ en: 'Used when a page has no title/description of its own.', ar: 'تُستخدم عندما لا يكون للصفحة عنوان أو وصف خاص.' }}
        />
      )}
      {tab === 'i18n' && <TranslationsEditor />}
    </>
  );
}
