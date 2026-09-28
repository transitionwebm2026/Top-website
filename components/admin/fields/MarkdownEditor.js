'use client';

import { useRef, useState } from 'react';
import { Bold, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, PencilLine, Quote } from 'lucide-react';
import ArticleBody from '@/components/blog/ArticleBody';
import { useUpload } from '@/lib/admin/hooks';
import { useAdmin } from '../AdminContext';
import { useFeedback } from '../feedback';
import { IconButton, Textarea, cx } from '../ui';

/**
 * Markdown editor with a formatting toolbar, image upload and live preview
 * rendered by the same component the public blog uses.
 */
export default function MarkdownEditor({ value = '', onChange, dir, rows = 16 }) {
  const area = useRef(null);
  const file = useRef(null);
  const [mode, setMode] = useState('write'); // write | preview
  const { upload, uploading } = useUpload();
  const { fail } = useFeedback();
  const { t } = useAdmin();

  /** Wrap the selection (or insert a placeholder) and restore the caret. */
  const wrap = (before, after = before, placeholder = t('md.text')) => {
    const el = area.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };

  /** Prefix every selected line (headings, lists, quotes). */
  const prefix = (marker) => {
    const el = area.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const block = value.slice(lineStart, e) || t('md.text');
    const lines = block.split('\n').map((l, i) => (typeof marker === 'function' ? marker(i) : marker) + l.replace(/^(#{1,6}\s|[-*]\s|\d+\.\s|>\s)/, ''));
    onChange(value.slice(0, lineStart) + lines.join('\n') + value.slice(e));
    requestAnimationFrame(() => el.focus());
  };

  const onImage = async (ev) => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    try {
      const url = await upload(f, 'blog');
      wrap('![', `](${url})`, t('md.imageAlt'));
    } catch (err) {
      fail(err);
    }
  };

  const tools = [
    [Heading2, t('md.heading'), () => prefix('## ')],
    [Heading3, t('md.subheading'), () => prefix('### ')],
    [Bold, t('md.bold'), () => wrap('**')],
    [Italic, t('md.italic'), () => wrap('_')],
    [List, t('md.bullets'), () => prefix('- ')],
    [ListOrdered, t('md.numbered'), () => prefix((i) => `${i + 1}. `)],
    [Quote, t('md.quote'), () => prefix('> ')],
    [Link2, t('md.link'), () => wrap('[', '](https://)', t('md.linkText'))],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-emerald-ink/60 focus-within:border-gold/50">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
        {tools.map(([Icon, label, fn]) => (
          <IconButton key={label} icon={Icon} label={label} onClick={fn} disabled={mode === 'preview'} />
        ))}
        <IconButton icon={ImagePlus} label={uploading ? t('common.uploading') : t('md.image')} onClick={() => file.current?.click()} disabled={mode === 'preview' || uploading} />
        <div className="ms-auto flex rounded-lg bg-white/5 p-0.5 text-xs font-semibold">
          {[
            ['write', PencilLine, t('md.write')],
            ['preview', Eye, t('md.preview')],
          ].map(([m, Icon, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cx('flex items-center gap-1 rounded-md px-2.5 py-1', mode === m ? 'bg-gold text-emerald-ink' : 'text-white/60 hover:text-white')}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>
      {mode === 'write' ? (
        <Textarea
          ref={area}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          dir={dir}
          className="rounded-none border-0 bg-transparent font-mono text-[0.83rem] focus:ring-0"
          placeholder={t('md.placeholder')}
        />
      ) : (
        <div className="max-h-[32rem] min-h-[16rem] overflow-y-auto px-5 py-4" dir={dir} lang={dir === 'rtl' ? 'ar' : 'en'}>
          {value.trim() ? <ArticleBody markdown={value} /> : <p className="text-sm text-white/40">{t('md.empty')}</p>}
        </div>
      )}
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={onImage} />
    </div>
  );
}
