'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, FileText, ImageIcon, Paperclip, UploadCloud, X } from 'lucide-react';
import { ACCEPT, MAX_BYTES, MAX_FILES, MAX_MB, extOf, formatSize, kindOf } from '@/lib/attachments';

// One look per kind, used for the file tiles and the accepted-type pills.
const KINDS = {
  image: { Icon: ImageIcon, label: 'JPG · PNG', tile: 'bg-gold/15 text-gold ring-gold/30' },
  pdf: { Icon: FileText, label: 'PDF', tile: 'bg-red-500/15 text-red-300 ring-red-400/30' },
  sheet: { Icon: FileSpreadsheet, label: 'Excel · CSV', tile: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30' },
};

const fill = (s = '', vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
let lastId = 0;

/**
 * Contact-form attachments: a drop zone (click, keyboard or drag & drop) and
 * the chosen files with type icon, image preview, size and upload progress.
 * Accepts images, PDF and Excel/CSV within lib/attachments.js limits.
 *
 * `items` = [{ id, file, preview }] (controlled by the form), `progress` =
 * { [id]: 0..1 } while sending, `t` = the `contact.*` translations.
 */
export default function AttachmentField({ items, onChange, progress = {}, disabled, t }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const depth = useRef(0); // dragenter/leave also fire for children
  const previews = useRef(new Set());
  const full = items.length >= MAX_FILES;
  const locked = disabled || full;

  // Image previews are object URLs: free each one when its file leaves the list, and all on unmount.
  useEffect(() => {
    const live = new Set(items.map((i) => i.preview).filter(Boolean));
    previews.current.forEach((url) => !live.has(url) && URL.revokeObjectURL(url));
    previews.current = live;
  }, [items]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const add = (fileList) => {
    const next = [...items];
    let problem = '';
    for (const file of fileList) {
      if (next.length >= MAX_FILES) {
        problem = fill(t.attachTooMany, { count: MAX_FILES });
        break;
      }
      const kind = kindOf(file.name);
      if (!kind) problem = fill(t.attachBadType, { name: file.name });
      else if (file.size > MAX_BYTES) problem = fill(t.attachTooBig, { name: file.name, size: MAX_MB });
      else if (file.size && !next.some((x) => x.file.name === file.name && x.file.size === file.size)) {
        next.push({ id: ++lastId, file, preview: kind === 'image' ? URL.createObjectURL(file) : null });
      }
    }
    setError(problem);
    if (next.length !== items.length) onChange(next);
  };

  const remove = (id) => {
    setError('');
    onChange(items.filter((i) => i.id !== id));
  };

  const drag = {
    onDragEnter: (e) => {
      e.preventDefault();
      depth.current += 1;
      if (!locked) setDragging(true);
    },
    onDragOver: (e) => e.preventDefault(),
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setDragging(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      if (!locked) add(e.dataTransfer.files);
    },
  };

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-white/85">
          <Paperclip size={15} className="text-gold" />
          {t.attachTitle}
          {t.optional && <span className="font-normal text-white/40">({t.optional})</span>}
        </span>
        <span className="font-[family-name:var(--font-montserrat)] text-xs text-white/40" dir="ltr">
          {items.length}/{MAX_FILES}
        </span>
      </div>

      <label
        {...drag}
        className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-7 text-center transition duration-300 has-[:focus-visible]:border-gold/80 has-[:focus-visible]:shadow-[0_0_0_4px_rgba(205,176,116,0.12)] ${
          dragging
            ? 'scale-[1.01] border-gold bg-gold/10 shadow-[0_0_40px_-10px_rgba(205,176,116,0.6)]'
            : locked
              ? 'cursor-not-allowed border-gold/10 bg-emerald-ink/20 opacity-60'
              : 'cursor-pointer border-gold/25 bg-emerald-ink/40 hover:border-gold/60 hover:bg-emerald-ink/60'
        }`}
      >
        <input
          type="file"
          multiple
          accept={ACCEPT}
          disabled={locked}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = ''; // the same file can be picked again after removing it
          }}
          className="sr-only"
        />
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold/25 to-gold/5 text-gold ring-1 ring-gold/30 transition duration-300 ${
            dragging ? '-translate-y-1 scale-110' : 'group-hover:-translate-y-0.5'
          }`}
        >
          <UploadCloud size={26} />
        </span>
        {full ? (
          <span className="text-sm font-semibold text-white/70">{t.attachFull}</span>
        ) : (
          <span className="text-sm text-white/75">
            {t.attachDrop}{' '}
            <span className="font-bold text-gold underline-offset-4 group-hover:underline">{t.attachBrowse}</span>
          </span>
        )}
        <span className="flex flex-wrap justify-center gap-1.5">
          {Object.values(KINDS).map(({ Icon, label, tile }) => (
            <span key={label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1 ${tile}`} dir="ltr">
              <Icon size={12} /> {label}
            </span>
          ))}
        </span>
        <span className="text-xs text-white/40">{fill(t.attachLimits, { count: MAX_FILES, size: MAX_MB })}</span>
      </label>

      {error && (
        <p role="alert" className="mt-2 animate-fade-in text-xs text-red-300">
          {error}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {items.map(({ id, file, preview }) => {
            const { Icon, tile } = KINDS[kindOf(file.name)];
            const pct = progress[id];
            const sending = pct !== undefined;
            return (
              <li key={id} className="flex animate-panel-in items-center gap-3 rounded-2xl border border-gold/15 bg-white/[0.03] p-2.5 pe-3">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-gold/25" />
                ) : (
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ring-1 ${tile}`}>
                    <Icon size={22} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white/90" dir="auto" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-montserrat)] text-xs text-white/45" dir="ltr">
                    {extOf(file.name).toUpperCase()} · {formatSize(file.size)}
                    {sending && pct < 1 && <span className="text-gold-light"> · {Math.round(pct * 100)}%</span>}
                  </p>
                  {sending && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-[width] duration-300"
                        style={{ width: `${Math.max(4, pct * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                {sending ? (
                  pct >= 1 && <CheckCircle2 size={20} className="shrink-0 animate-fade-in text-whatsapp" />
                ) : (
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    disabled={disabled}
                    aria-label={`${t.attachRemove}: ${file.name}`}
                    title={t.attachRemove}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
