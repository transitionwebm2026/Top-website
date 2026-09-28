'use client';

/* eslint-disable @next/next/no-img-element -- thumbnails of arbitrary uploaded URLs */

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Inbox, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { emptyRow, isLocalized } from '@/lib/cms/schema';
import { toPayload, useTable } from '@/lib/admin/hooks';
import ShapeIcon from '@/components/products/ShapeIcon';
import { useAdmin } from './AdminContext';
import { Dialog, useFeedback } from './feedback';
import { Fields } from './fields/Fields';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorNote, IconButton, Input, Spinner, Toggle, cx } from './ui';

/**
 * Generic list + editor for one table.
 *
 * @param table        database table
 * @param title        card title ({ en, ar })
 * @param noun         what one row is called ({ en: 'product', ar: 'منتج' })
 * @param fields       field schema (lib/admin/collections.js)
 * @param eq           fixed filters, also written on insert (e.g. { kind: 'partner' })
 * @param select       PostgREST select (joins are for display only; saves send schema fields)
 * @param titleField   localized field shown as the row title
 * @param imageField   column shown as thumbnail
 * @param columns      extra list details: [{ key, render(row, lang, tr) }]
 * @param sortable     rows have sort_order and can be reordered
 * @param defaults     values for new rows
 * @param context      passed to fields (select options, upload folder)
 * @param beforeSave   (payload, row, original) => payload
 * @param afterSave    async (saved, row, api) => void
 * @param rowActions   (row, api) => node
 */
export default function CollectionManager({
  table,
  title,
  description,
  noun = { en: 'item', ar: 'عنصر' },
  fields,
  eq = {},
  select = '*',
  order,
  titleField = 'title',
  imageField,
  iconField,
  columns = [],
  sortable = true,
  defaults = {},
  context,
  beforeSave,
  afterSave,
  rowActions,
  publishField = fields.some((f) => f.name === 'is_published') ? 'is_published' : null,
}) {
  const { lang, t, tr } = useAdmin();
  const { toast, fail, confirm } = useFeedback();
  const api = useTable(table, { select, eq, order: order || (sortable ? [['sort_order', true], ['created_at', true]] : [['created_at', false]]) });
  const { rows, loading, error } = api;
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // { original, row }
  const [saving, setSaving] = useState(false);
  const name = tr(noun);

  const other = lang === 'ar' ? 'en' : 'ar';
  const label = (r) => r[`${titleField}_${lang}`] || r[`${titleField}_${other}`] || r[titleField] || '—';
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r[`${titleField}_en`], r[`${titleField}_ar`], r[titleField], r.slug].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [rows, query, titleField]);

  const openNew = () => setEditing({ original: null, row: { ...emptyRow(fields), ...defaults } });
  const openEdit = (r) => setEditing({ original: r, row: { ...emptyRow(fields), ...structuredClone(r) } });

  const validate = (row) => {
    for (const f of fields) {
      if (!f.required) continue;
      const langs = isLocalized(f) ? (f.required === 'en' ? ['en'] : ['en', 'ar']) : [null];
      for (const l of langs) {
        const v = l ? row[`${f.name}_${l}`] : row[f.name];
        if (v == null || (typeof v === 'string' && !v.trim())) {
          return l ? t('col.requiredLang', { field: tr(f.label), lang: t(`lang.${l}`) }) : t('col.required', { field: tr(f.label) });
        }
      }
    }
    return null;
  };

  const save = async () => {
    const { original, row } = editing;
    const problem = validate(row);
    if (problem) return toast(problem, 'error');
    setSaving(true);
    try {
      let payload = toPayload(fields, row, { ...eq, ...(original ? {} : sortable ? { sort_order: rows.length } : {}) });
      if (beforeSave) payload = await beforeSave(payload, row, original);
      const saved = await api.save(original?.id, payload);
      if (afterSave) await afterSave(saved, row, api);
      toast(t(original ? 'col.saved' : 'col.created', { name: label(saved) }));
      setEditing(null);
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    const ok = await confirm({ title: t('col.deleteTitle', { name: label(r) }), message: t('col.deleteMsg'), confirmLabel: t('common.delete'), danger: true });
    if (!ok) return;
    try {
      await api.remove(r.id);
      toast(t('col.deleted'));
      if (editing?.original?.id === r.id) setEditing(null);
    } catch (e) {
      fail(e);
    }
  };

  const move = async (i, d) => {
    const ids = rows.map((r) => r.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    try {
      await api.reorder(ids);
    } catch (e) {
      fail(e);
      api.reload();
    }
  };

  const togglePublish = async (r, v) => {
    try {
      await api.patch(r.id, { [publishField]: v });
    } catch (e) {
      fail(e);
    }
  };

  const canReorder = sortable && !query;

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        actions={
          <>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/35" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className="h-9 w-44 ps-9 sm:w-56" />
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={openNew}>
              {t('col.new', { noun: name })}
            </Button>
          </>
        }
      />

      {error && (
        <div className="p-5">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : !visible.length ? (
        <EmptyState
          icon={Inbox}
          title={query ? t('col.noMatches') : t('common.nothing')}
          description={query ? t('col.noMatchesDesc') : t('col.emptyDesc')}
          action={
            !query && (
              <Button size="sm" icon={Plus} onClick={openNew}>
                {t('col.new', { noun: name })}
              </Button>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-white/5">
          {visible.map((r, i) => (
            <li key={r.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03] sm:px-5">
              {canReorder && (
                <div className="flex flex-col">
                  <IconButton icon={ChevronUp} label={t('common.moveUp')} disabled={i === 0} onClick={() => move(i, -1)} className="h-6 w-6" />
                  <IconButton icon={ChevronDown} label={t('common.moveDown')} disabled={i === visible.length - 1} onClick={() => move(i, 1)} className="h-6 w-6" />
                </div>
              )}
              {(imageField || iconField) && (
                <button onClick={() => openEdit(r)} className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/95">
                  {imageField && r[imageField] ? (
                    <img src={r[imageField]} alt="" className="h-full w-full object-contain" />
                  ) : iconField ? (
                    <span className="grid h-full w-full place-items-center bg-emerald-night">
                      <ShapeIcon name={r[iconField]} className="h-8 w-8" />
                    </span>
                  ) : null}
                </button>
              )}
              <button onClick={() => openEdit(r)} className="min-w-0 flex-1 text-start">
                <span className="block truncate font-semibold text-white/90" dir="auto">
                  {label(r)}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                  {r.slug && (
                    <span className="font-mono" dir="ltr">
                      /{r.slug}
                    </span>
                  )}
                  {columns.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1">
                      {c.render(r, lang, tr)}
                    </span>
                  ))}
                </span>
              </button>
              {rowActions?.(r, api)}
              {publishField && (
                <div className="hidden sm:block" title={r[publishField] ? t('common.published') : t('common.hidden')}>
                  <Toggle checked={!!r[publishField]} onChange={(v) => togglePublish(r, v)} />
                </div>
              )}
              <IconButton icon={Pencil} label={t('common.edit')} onClick={() => openEdit(r)} />
              <IconButton icon={Trash2} label={t('common.delete')} onClick={() => remove(r)} className="hover:!text-red-300" />
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        drawer
        size="lg"
        title={editing?.original ? t('col.edit', { noun: name }) : t('col.new', { noun: name })}
        footer={
          <div className="flex items-center gap-2">
            {editing?.original && (
              <Button variant="danger" icon={Trash2} onClick={() => remove(editing.original)} disabled={saving}>
                {t('common.delete')}
              </Button>
            )}
            <div className="ms-auto flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" icon={Save} loading={saving} onClick={save}>
                {editing?.original ? t('common.saveChanges') : t('col.create', { noun: name })}
              </Button>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="p-6">
            {editing.original && publishField && !editing.row[publishField] && (
              <div className="mb-5">
                <Badge tone="red">{t('col.hiddenBadge')}</Badge>
              </div>
            )}
            <Fields fields={fields} row={editing.row} onChange={(p) => setEditing((e) => ({ ...e, row: { ...e.row, ...p } }))} context={context} />
          </div>
        )}
      </Dialog>
    </Card>
  );
}

/** Small helper for list details. */
export const Muted = ({ children, className }) => <span className={cx('text-white/45', className)}>{children}</span>;
