'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { toPayload, useSingleton } from '@/lib/admin/hooks';
import { emptyRow } from '@/lib/cms/schema';
import { useAdmin } from '../AdminContext';
import { useFeedback } from '../feedback';
import { Fields } from '../fields/Fields';
import { Badge, Button, Card, CardHeader, ErrorNote, Spinner } from '../ui';

/** Edits a group of `site_settings` columns (the table's single row). `title` may be { en, ar }. */
export default function SettingsForm({ fields, title, description, children }) {
  const { t, tr } = useAdmin();
  const { row: saved, loading, error, save } = useSingleton('site_settings');
  const { toast, fail } = useFeedback();
  const [row, setRow] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (saved) setRow({ ...emptyRow(fields), ...saved });
  }, [saved, fields]);

  if (loading) return <Spinner />;
  if (error || !saved) return <ErrorNote>{error || 'settings.missing'}</ErrorNote>;
  if (!row) return null;

  const payload = toPayload(fields, row);
  const dirty = JSON.stringify(payload) !== JSON.stringify(toPayload(fields, { ...emptyRow(fields), ...saved }));

  const submit = async () => {
    setSaving(true);
    try {
      await save(payload);
      toast(t('settings.saved', { name: tr(title) }));
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            {tr(title)}
            {dirty && <Badge tone="gold">{t('common.unsaved')}</Badge>}
          </span>
        }
        description={description}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={RotateCcw} disabled={!dirty || saving} onClick={() => setRow({ ...emptyRow(fields), ...saved })}>
              {t('common.discard')}
            </Button>
            <Button variant="primary" size="sm" icon={Save} loading={saving} disabled={!dirty} onClick={submit}>
              {t('common.save')}
            </Button>
          </>
        }
      />
      <div className="p-5">
        <Fields fields={fields} row={row} onChange={(p) => setRow((r) => ({ ...r, ...p }))} context={{ folder: 'branding' }} />
        {children?.(row)}
      </div>
    </Card>
  );
}
