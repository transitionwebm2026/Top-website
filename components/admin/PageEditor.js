'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Globe, Save } from 'lucide-react';
import { usePageSections } from '@/lib/admin/hooks';
import { pageSeoFields } from '@/lib/admin/collections';
import { useAdmin } from './AdminContext';
import { useFeedback } from './feedback';
import { Fields } from './fields/Fields';
import SectionEditor from './SectionEditor';
import { Button, Card, CardHeader, ErrorNote, PageHeader, Spinner, Tabs } from './ui';

/**
 * Tabbed editor for one CMS page.
 *
 * tabs: [{ id, label: { en, ar }, icon, sections: ['hero_section', …], hideFields?, render?: (ctx) => node }]
 * An SEO tab (pages.meta_*) is appended automatically.
 */
export default function PageEditor({ slug, title, description, icon, tabs }) {
  const { t } = useAdmin();
  const ctx = usePageSections(slug);
  const { page, sections, loading, error, saveSection, setVisible } = ctx;
  const allTabs = useMemo(() => [...tabs, { id: 'seo', label: t('page.seo'), icon: Globe, seo: true }], [tabs, t]);
  const [tab, setTab] = useState(allTabs[0].id);
  const current = allTabs.find((x) => x.id === tab) || allTabs[0];

  return (
    <>
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={
          page?.path && (
            <Button href={page.path} external icon={ExternalLink} size="sm">
              {t('common.viewPage')}
            </Button>
          )
        }
      />
      <Tabs tabs={allTabs} value={current.id} onChange={setTab} />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : current.seo ? (
        <SeoEditor page={page} savePage={ctx.savePage} />
      ) : (
        <div className="flex flex-col gap-6">
          {(current.sections || []).map((key) => (
            <SectionEditor key={key} section={sections[key]} onSave={saveSection} onToggleVisible={setVisible} hideFields={current.hideFields} folder={slug} />
          ))}
          {current.render?.(ctx)}
        </div>
      )}
    </>
  );
}

function SeoEditor({ page, savePage }) {
  const { t } = useAdmin();
  const { toast, fail } = useFeedback();
  const [row, setRow] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setRow({
        meta_title_ar: page.meta_title_ar || '',
        meta_title_en: page.meta_title_en || '',
        meta_description_ar: page.meta_description_ar || '',
        meta_description_en: page.meta_description_en || '',
        og_image: page.og_image || '',
      });
    }
  }, [page]);

  const save = async () => {
    setSaving(true);
    try {
      const nullIfEmpty = (v) => (typeof v === 'string' && !v.trim() ? null : v);
      await savePage(Object.fromEntries(Object.entries(row).map(([k, v]) => [k, nullIfEmpty(v)])));
      toast(t('page.seoSaved'));
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={t('page.seoTitle')}
        description={t('page.seoDesc')}
        actions={
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={save}>
            {t('page.seoSave')}
          </Button>
        }
      />
      <div className="p-5">
        <Fields fields={pageSeoFields} row={row} onChange={(p) => setRow((r) => ({ ...r, ...p }))} context={{ folder: 'seo' }} />
      </div>
    </Card>
  );
}
