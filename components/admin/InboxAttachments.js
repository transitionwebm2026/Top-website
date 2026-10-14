'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, File, FileSpreadsheet, FileText, ImageIcon, Paperclip } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ATTACHMENT_BUCKET, formatSize, kindOf } from '@/lib/attachments';
import { useAdmin } from './AdminContext';
import { ErrorNote, cx } from './ui';

const KINDS = {
  image: [ImageIcon, 'bg-gold/15 text-gold ring-gold/30'],
  pdf: [FileText, 'bg-red-500/15 text-red-300 ring-red-400/30'],
  sheet: [FileSpreadsheet, 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30'],
};
const linkCls =
  'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/[0.06] hover:text-white aria-disabled:pointer-events-none aria-disabled:opacity-30';

/**
 * Files attached to a contact message. The bucket is private: each file opens
 * through a signed link that stays valid for an hour.
 */
export default function InboxAttachments({ files }) {
  const { t } = useAdmin();
  const [urls, setUrls] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setUrls({});
    setError('');
    createClient()
      .storage.from(ATTACHMENT_BUCKET)
      .createSignedUrls(
        files.map((f) => f.path),
        3600,
      )
      .then(({ data, error: err }) => {
        if (err) throw err;
        if (alive) setUrls(Object.fromEntries(data.filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl])));
      })
      .catch(() => alive && setError('inbox.filesError'));
    return () => {
      alive = false;
    };
  }, [files]);

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
        <Paperclip size={14} className="text-gold" />
        {t('inbox.attachments')}
        <span className="text-white/35">({files.length})</span>
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <ul className="grid gap-2 sm:grid-cols-2">
        {files.map((f) => {
          const url = urls[f.path];
          const kind = kindOf(f.name);
          const [Icon, tile] = KINDS[kind] || [File, 'bg-white/[0.07] text-white/70 ring-white/10'];
          return (
            <li key={f.path} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2.5">
              {kind === 'image' && url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-gold/25" />
              ) : (
                <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-lg ring-1', tile)}>
                  <Icon size={20} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white/85" dir="auto" title={f.name}>
                  {f.name}
                </p>
                <p className="text-xs text-white/40" dir="ltr">
                  {formatSize(f.size)}
                </p>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer" aria-disabled={!url} aria-label={t('inbox.open')} title={t('inbox.open')} className={linkCls}>
                <ExternalLink size={15} />
              </a>
              <a
                href={url && `${url}&download=${encodeURIComponent(f.name)}`}
                aria-disabled={!url}
                aria-label={t('inbox.download')}
                title={t('inbox.download')}
                className={linkCls}
              >
                <Download size={15} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
