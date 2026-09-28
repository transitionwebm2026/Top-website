'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { inputCls, cx } from '../ui';

/** Chips editor for string arrays. Enter or comma adds; Backspace on empty removes the last chip. */
export default function TagsInput({ value = [], onChange, placeholder, dir }) {
  const { t } = useAdmin();
  const [draft, setDraft] = useState('');
  const list = Array.isArray(value) ? value : [];

  const add = (raw) => {
    const items = raw
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !list.includes(s));
    if (items.length) onChange([...list, ...items]);
    setDraft('');
  };

  return (
    <div className={cx(inputCls, 'flex min-h-[42px] flex-wrap items-center gap-1.5 py-1.5')} dir={dir}>
      {list.map((tag, i) => (
        <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-lg bg-gold/15 py-0.5 ps-2 pe-1 text-xs font-semibold text-gold-light">
          {tag}
          <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label={`${t('common.remove')} ${tag}`} className="rounded p-0.5 hover:bg-gold/20">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => (/[,،]/.test(e.target.value) ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && !draft && list.length) {
            onChange(list.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text');
          if (/[\n,،]/.test(text)) {
            e.preventDefault();
            add(text);
          }
        }}
        placeholder={list.length ? '' : placeholder || t('common.tagsPlaceholder')}
        className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-white/25"
      />
    </div>
  );
}
