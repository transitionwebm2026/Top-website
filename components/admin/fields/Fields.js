'use client';

// Schema-driven form renderer. Works on a flat "row": localized fields are read
// from / written to `<name>_ar` + `<name>_en`, everything else to `<name>`.
// Used for table rows, JSON array items (repeaters) and section content.
// Labels, help and placeholders may be strings or `{ en, ar }` objects.

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2, Wand2 } from 'lucide-react';
import ShapeIcon from '@/components/products/ShapeIcon';
import { ICON_NAMES, emptyRow, isLocalized } from '@/lib/cms/schema';
import { useAdmin } from '../AdminContext';
import { Button, Help, IconButton, Input, Label, LangChip, Select, Textarea, Toggle, cx } from '../ui';
import { GalleryInput, MediaInput } from './MediaInput';
import MarkdownEditor from './MarkdownEditor';
import TagsInput from './TagsInput';

export const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

/** `<iframe src="…">` pasted from Google Maps → just the src URL. */
const extractSrc = (v) => v.match(/src=["']([^"']+)["']/i)?.[1] ?? v;

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// -----------------------------------------------------------------------------
// One value (one language, or a language-neutral field)
// -----------------------------------------------------------------------------
function Control({ field, value, onChange, lang, row, context }) {
  const { t, tr } = useAdmin();
  const dir = lang === 'ar' ? 'rtl' : lang === 'en' ? 'ltr' : undefined;
  const common = { id: `${field.name}${lang ? `_${lang}` : ''}`, placeholder: tr(field.placeholder) };

  switch (field.type) {
    case 'textarea':
      return <Textarea {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={field.rows || 3} dir={dir} />;
    case 'markdown':
      return <MarkdownEditor value={value ?? ''} onChange={onChange} dir={dir} />;
    case 'number':
      return (
        <Input {...common} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} min={field.min} max={field.max} dir="ltr" />
      );
    case 'image':
    case 'file':
      return <MediaInput value={value} onChange={onChange} kind={field.type} folder={field.folder || context?.folder} />;
    case 'gallery':
      return <GalleryInput value={value} onChange={onChange} folder={field.folder || context?.folder} />;
    case 'tags':
      return <TagsInput value={value} onChange={onChange} dir={dir} placeholder={common.placeholder} />;
    case 'toggle':
      return <Toggle checked={!!value} onChange={onChange} label={field.toggleLabel} />;
    case 'select': {
      const options = field.options || context?.options?.[field.name] || [];
      return (
        <Select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.allowEmpty !== false && !field.required && <option value="">—</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {tr(o.label)}
            </option>
          ))}
        </Select>
      );
    }
    case 'color':
      return (
        <div className="flex items-center gap-2" dir="ltr">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
          <Input {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" maxLength={7} />
        </div>
      );
    case 'icon':
      return (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-night">
            <ShapeIcon name={value || 'pipe'} className="h-7 w-7" />
          </span>
          <Select {...common} value={value || 'pipe'} onChange={(e) => onChange(e.target.value)} dir="ltr">
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
      );
    case 'date':
      return (
        <Input
          {...common}
          type="datetime-local"
          value={toLocalInput(value)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
          dir="ltr"
        />
      );
    case 'slug':
      return (
        <div className="flex gap-2">
          <Input {...common} value={value ?? ''} onChange={(e) => onChange(slugify(e.target.value))} dir="ltr" className="font-mono" />
          <Button
            size="md"
            variant="ghost"
            icon={Wand2}
            title={t('common.generateTitle')}
            onClick={() => onChange(slugify(row?.[`${field.from}_en`] || row?.[field.from] || ''))}
          >
            {t('common.generate')}
          </Button>
        </div>
      );
    case 'embed':
      return (
        <div className="space-y-2">
          <Input {...common} value={value ?? ''} onChange={(e) => onChange(extractSrc(e.target.value.trim()))} placeholder={t('common.embedPlaceholder')} dir="ltr" />
          {value && /^https:\/\//.test(value) && (
            <iframe title={t('common.mapPreview')} src={value} className="map-dark h-48 w-full rounded-xl border border-white/10" loading="lazy" />
          )}
        </div>
      );
    case 'repeater':
      return <Repeater field={field} value={value} onChange={onChange} context={context} />;
    default:
      return (
        <Input
          {...common}
          type={field.type === 'url' ? 'url' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          dir={field.type === 'url' ? 'ltr' : dir}
          maxLength={field.maxLength}
        />
      );
  }
}

// -----------------------------------------------------------------------------
// One field (label + one control, or both language controls side by side)
// -----------------------------------------------------------------------------
export function Field({ field, row, onChange, context }) {
  const { lang: uiLang } = useAdmin();
  const localized = isLocalized(field);
  const set = (key) => (v) => onChange({ [key]: v });
  // The dashboard's own language comes first.
  const langs = uiLang === 'ar' ? ['ar', 'en'] : ['en', 'ar'];

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <Toggle checked={!!row[field.name]} onChange={set(field.name)} label={field.label} description={field.help} />
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={localized ? `${field.name}_${langs[0]}` : field.name} required={field.required}>
        {field.label}
      </Label>
      {localized ? (
        <div className={cx('grid gap-3', field.type === 'markdown' ? 'xl:grid-cols-2' : 'md:grid-cols-2')}>
          {langs.map((lang) => (
            <div key={lang} lang={lang}>
              <div className="mb-1.5 flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <LangChip lang={lang} />
              </div>
              <Control field={field} value={row[`${field.name}_${lang}`]} onChange={set(`${field.name}_${lang}`)} lang={lang} row={row} context={context} />
            </div>
          ))}
        </div>
      ) : (
        <Control field={field} value={row[field.name]} onChange={set(field.name)} row={row} context={context} />
      )}
      <Help>{field.help}</Help>
    </div>
  );
}

/** A grid of fields. `half: true` fields share a row on wide screens. */
export function Fields({ fields, row, onChange, context }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields
        .filter((f) => !f.hidden)
        .map((f) => (
          <div key={f.name} className={f.half && !isLocalized(f) ? '' : 'md:col-span-2'}>
            <Field field={f} row={row} onChange={onChange} context={context} />
          </div>
        ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Repeater — ordered list of sub-rows (stats, timeline, specs, brands, links…)
// -----------------------------------------------------------------------------
function Repeater({ field, value, onChange, context }) {
  const { t, tr, lang } = useAdmin();
  const items = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(() => (items.length <= 3 ? items.map((_, i) => i) : []));

  const update = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i, d) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    setOpen((o) => o.map((x) => (x === i ? i + d : x === i + d ? i : x)));
  };
  const add = () => {
    onChange([...items, emptyRow(field.fields)]);
    setOpen((o) => [...o, items.length]);
  };
  const duplicate = (i) => {
    onChange([...items.slice(0, i + 1), structuredClone(items[i]), ...items.slice(i + 1)]);
  };
  const remove = (i) => {
    onChange(items.filter((_, j) => j !== i));
    setOpen((o) => o.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
  };
  const summary = (it) => {
    const k = field.itemLabel;
    const other = lang === 'ar' ? 'en' : 'ar';
    const v = k ? it[`${k}_${lang}`] || it[`${k}_${other}`] || it[k] : '';
    return String(v ?? '').slice(0, 80);
  };

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const isOpen = open.includes(i);
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical size={14} className="text-white/25" />
              <button
                type="button"
                onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== i) : [...o, i]))}
                className="flex min-w-0 flex-1 items-center gap-2 text-start text-sm"
              >
                <span className="grid h-6 min-w-6 place-items-center rounded-md bg-gold/15 px-1 font-mono text-[0.7rem] font-bold text-gold">{i + 1}</span>
                <span className="truncate font-semibold text-white/80" dir="auto">
                  {summary(it) || <span className="text-white/35">{t('common.untitled')}</span>}
                </span>
              </button>
              <IconButton icon={ChevronUp} label={t('common.moveUp')} disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon={ChevronDown} label={t('common.moveDown')} disabled={i === items.length - 1} onClick={() => move(i, 1)} />
              <IconButton icon={Copy} label={t('common.duplicate')} onClick={() => duplicate(i)} />
              <IconButton icon={Trash2} label={t('common.remove')} onClick={() => remove(i)} className="hover:!text-red-300" />
            </div>
            {isOpen && (
              <div className="border-t border-white/5 p-4">
                <Fields fields={field.fields} row={it} onChange={(patch) => update(i, patch)} context={context} />
              </div>
            )}
          </div>
        );
      })}
      <Button size="sm" icon={Plus} onClick={add}>
        {t('common.addItem', { item: tr(field.addLabel) || t('common.item') })}
      </Button>
    </div>
  );
}
