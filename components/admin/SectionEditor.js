'use client';

import { useEffect, useMemo, useState } from 'react';
import { EyeOff, RotateCcw, Save } from 'lucide-react';
import { SECTION_TYPES, formToSection, sectionToForm } from '@/lib/cms/schema';
import { SECTION_LABELS } from '@/lib/admin/i18n';
import { useAdmin } from './AdminContext';
import { useFeedback } from './feedback';
import { Fields } from './fields/Fields';
import { Badge, Button, Card, CardHeader, EmptyState, Toggle } from './ui';

/**
 * Editor for one page section. Converts `content_ar` / `content_en` into a
 * flat bilingual form (lib/cms/schema.js), and back on save.
 * `hideFields` only hides inputs; their stored values are kept on save.
 */
export default function SectionEditor({ section, onSave, onToggleVisible, description, folder, hideFields = [] }) {
  const { t, tr, locale } = useAdmin();
  const schema = SECTION_TYPES[section?.type];
  const { toast, fail } = useFeedback();
  const content = section?.content;
  // Re-initialise only when the saved content changes (not on visibility toggles).
  const initial = useMemo(
    () => (schema ? sectionToForm(schema.fields, content?.content_ar, content?.content_en) : {}),
    [schema, content],
  );
  const [row, setRow] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setRow(initial), [initial]);

  if (!section) return <EmptyState title={t('section.notFound')} description={t('section.notFoundDesc')} />;
  if (!schema) return <EmptyState title={t('section.unknown', { type: section.type })} />;

  const name = tr(SECTION_LABELS[section.key]) || section.label || tr(schema.label);
  const dirty = JSON.stringify(row) !== JSON.stringify(initial);
  const updated = content?.updated_at && new Date(content.updated_at).toLocaleString(locale);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(section.id, formToSection(schema.fields, row));
      toast(t('section.saved', { name }));
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (v) => {
    try {
      await onToggleVisible(section.id, v);
      toast(v ? t('section.shown') : t('section.hiddenToast'));
    } catch (e) {
      fail(e);
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {name}
            {!section.is_visible && (
              <Badge tone="red">
                <EyeOff size={11} /> {t('common.hidden')}
              </Badge>
            )}
            {dirty && <Badge tone="gold">{t('common.unsaved')}</Badge>}
          </span>
        }
        description={description || (updated ? t('section.lastSaved', { date: updated }) : tr(schema.label))}
        actions={
          <>
            <Toggle checked={section.is_visible} onChange={toggle} label={t('section.visibility')} />
            <Button variant="ghost" size="sm" icon={RotateCcw} disabled={!dirty || saving} onClick={() => setRow(initial)}>
              {t('common.discard')}
            </Button>
            <Button variant="primary" size="sm" icon={Save} loading={saving} disabled={!dirty} onClick={save}>
              {t('section.save')}
            </Button>
          </>
        }
      />
      <div className="p-5">
        <Fields
          fields={schema.fields.filter((f) => !hideFields.includes(f.name))}
          row={row}
          onChange={(patch) => setRow((r) => ({ ...r, ...patch }))}
          context={{ folder: folder || 'pages' }}
        />
      </div>
    </Card>
  );
}
