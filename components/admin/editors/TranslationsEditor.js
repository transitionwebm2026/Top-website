'use client';

import { useMemo, useState } from 'react';
import { Languages, RotateCcw, Save, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { throwIf, useTable } from '@/lib/admin/hooks';
import { revalidateCms } from '@/app/admin/actions';
import { useAdmin } from '../AdminContext';
import { useFeedback } from '../feedback';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorNote, Input, LangChip, Spinner, cx } from '../ui';

/**
 * Static UI text (buttons, labels, form messages, footer headings) from the
 * `translations` table. Keys are referenced by the site's components, so only
 * the values are editable here.
 */
export default function TranslationsEditor() {
  const { t, lang } = useAdmin();
  const { toast, fail } = useFeedback();
  const { rows, loading, error, reload } = useTable('translations', { order: [['key', true]] });
  const [ns, setNs] = useState('all');
  const [query, setQuery] = useState('');
  const [edits, setEdits] = useState({}); // key → { value_ar, value_en }
  const [saving, setSaving] = useState(false);
  const langs = lang === 'ar' ? ['ar', 'en'] : ['en', 'ar'];

  const namespaces = useMemo(() => [...new Set(rows.map((r) => r.namespace))], [rows]);
  const visible = rows.filter((r) => {
    if (ns !== 'all' && r.namespace !== ns) return false;
    const q = query.trim().toLowerCase();
    return !q || [r.key, r.value_en, r.value_ar].some((v) => (v || '').toLowerCase().includes(q));
  });

  const value = (r, l) => edits[r.key]?.[`value_${l}`] ?? r[`value_${l}`];
  const set = (r, l, v) =>
    setEdits((e) => {
      const next = { ...e, [r.key]: { value_ar: value(r, 'ar'), value_en: value(r, 'en'), ...e[r.key], [`value_${l}`]: v } };
      if (next[r.key].value_ar === r.value_ar && next[r.key].value_en === r.value_en) delete next[r.key];
      return next;
    });
  const changed = Object.keys(edits).length;

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(edits).map(([key, v]) => ({ key, ...v }));
      const { error: err } = await createClient().from('translations').upsert(payload, { onConflict: 'key' });
      throwIf(err);
      await revalidateCms();
      await reload();
      setEdits({});
      toast(t('i18n.saved', { n: payload.length }));
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
            {t('i18n.title')} {changed > 0 && <Badge tone="gold">{t('i18n.unsaved', { n: changed })}</Badge>}
          </span>
        }
        description={t('i18n.desc')}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={RotateCcw} disabled={!changed || saving} onClick={() => setEdits({})}>
              {t('common.discard')}
            </Button>
            <Button variant="primary" size="sm" icon={Save} loading={saving} disabled={!changed} onClick={save}>
              {changed ? t('i18n.save', { n: changed }) : t('common.save')}
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/35" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('i18n.search')} className="h-9 w-56 ps-9" />
        </div>
        <div className="flex flex-wrap gap-1" dir="ltr">
          {['all', ...namespaces].map((n) => (
            <button
              key={n}
              onClick={() => setNs(n)}
              className={cx('rounded-lg px-2.5 py-1 text-xs font-semibold transition', ns === n ? 'bg-gold text-emerald-ink' : 'bg-white/[0.04] text-white/60 hover:text-white')}
            >
              {n === 'all' ? t('i18n.all') : n}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="p-5">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : !visible.length ? (
        <EmptyState icon={Languages} title={t('i18n.none')} />
      ) : (
        <>
          <div className="hidden gap-2 border-b border-white/5 px-5 py-2 text-xs font-semibold text-white/40 lg:grid lg:grid-cols-[13rem_1fr_1fr]">
            <span>{t('i18n.key')}</span>
            {langs.map((l) => (
              <span key={l}>
                <LangChip lang={l} />
              </span>
            ))}
          </div>
          <div className="divide-y divide-white/5">
            {visible.map((r) => (
              <div key={r.key} className={cx('grid gap-2 px-5 py-3 lg:grid-cols-[13rem_1fr_1fr] lg:items-center', edits[r.key] && 'bg-gold/[0.04]')}>
                <code className="truncate text-xs text-gold/80" title={r.key} dir="ltr">
                  {r.key}
                </code>
                {langs.map((l) => (
                  <Input
                    key={l}
                    value={value(r, l)}
                    onChange={(e) => set(r, l, e.target.value)}
                    aria-label={`${r.key} — ${t(`lang.${l}`)}`}
                    className="h-9"
                    dir={l === 'ar' ? 'rtl' : 'ltr'}
                    lang={l}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
