'use client';

/* eslint-disable @next/next/no-img-element -- previews must show any URL, incl. not-yet-whitelisted hosts */

import { useRef } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, FileText, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useUpload } from '@/lib/admin/hooks';
import { useAdmin } from '../AdminContext';
import { useFeedback } from '../feedback';
import { Button, IconButton, Input } from '../ui';

const ACCEPT = {
  image: 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml',
  file: 'application/pdf,image/png,image/jpeg,image/webp',
};

const isPdf = (url = '') => /\.pdf($|\?)/i.test(url);

/** Single image or file: preview, upload to Storage, or paste a URL / site path. */
export function MediaInput({ value, onChange, kind = 'image', folder = 'uploads' }) {
  const { upload, uploading } = useUpload();
  const { toast, fail } = useFeedback();
  const { t } = useAdmin();
  const input = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onChange(await upload(file, folder));
      toast(t('common.uploaded'));
    } catch (err) {
      fail(err);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="grid h-20 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/95">
        {value && !isPdf(value) ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : value ? (
          <FileText className="text-emerald-deep" size={30} />
        ) : (
          <ImagePlus className="text-emerald-deep/40" size={26} />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={t('common.mediaPlaceholder')} dir="ltr" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" icon={Upload} loading={uploading} onClick={() => input.current?.click()}>
            {t('common.upload')}
          </Button>
          {value && (
            <>
              <Button size="sm" variant="ghost" icon={ExternalLink} href={value} external>
                {t('common.open')}
              </Button>
              <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onChange('')}>
                {t('common.remove')}
              </Button>
            </>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept={ACCEPT[kind]} className="hidden" onChange={onFile} />
    </div>
  );
}

/** Ordered list of images (product gallery, catalog pages). */
export function GalleryInput({ value = [], onChange, folder = 'gallery' }) {
  const { upload, uploading } = useUpload();
  const { toast, fail } = useFeedback();
  const { t } = useAdmin();
  const input = useRef(null);
  const list = Array.isArray(value) ? value : [];

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    try {
      const urls = [];
      for (const f of files) urls.push(await upload(f, folder));
      onChange([...list, ...urls]);
      toast(t('common.imagesUploaded', { n: urls.length }));
    } catch (err) {
      fail(err);
    }
  };

  const move = (i, d) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white">
            <img src={src} alt="" className="h-full w-full object-contain" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-emerald-ink/85 p-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <IconButton icon={ArrowLeft} label={t('common.moveEarlier')} disabled={i === 0} onClick={() => move(i, -1)} className="rtl:-scale-x-100" />
              <IconButton icon={ArrowRight} label={t('common.moveLater')} disabled={i === list.length - 1} onClick={() => move(i, 1)} className="rtl:-scale-x-100" />
              <IconButton icon={Trash2} label={t('common.remove')} onClick={() => onChange(list.filter((_, j) => j !== i))} />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="grid aspect-square place-items-center rounded-xl border border-dashed border-gold/30 text-gold/70 transition hover:border-gold hover:bg-gold/5 hover:text-gold disabled:opacity-50"
        >
          <span className="flex flex-col items-center gap-1 text-xs font-semibold">
            <ImagePlus size={22} />
            {uploading ? t('common.uploading') : t('common.addImages')}
          </span>
        </button>
      </div>
      <input ref={input} type="file" accept={ACCEPT.image} multiple className="hidden" onChange={onFiles} />
    </div>
  );
}
