'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isShortMapLink, toMapEmbed } from '@/lib/maps';
import { useAdmin } from '../AdminContext';
import { Input } from '../ui';

/** Share link → embeddable map URL, via the `resolve-map-link` Edge Function; null if it can't be resolved. */
async function resolveShortLink(link) {
  const { data, error } = await createClient().functions.invoke('resolve-map-link', { body: { url: link } });
  return !error && data?.url ? toMapEmbed(data.url) : null;
}

/**
 * Google Maps location. Accepts a share link (maps.app.goo.gl — resolved by the
 * `resolve-map-link` Edge Function), any google.com/maps URL, the "Embed a map"
 * <iframe> code, coordinates or a typed address, and stores the embeddable URL
 * the site's <iframe> needs.
 */
export default function MapInput({ id, value, onChange }) {
  const { t } = useAdmin();
  const [text, setText] = useState(value ?? '');
  const [status, setStatus] = useState('idle'); // idle · loading · error · unresolved (share link)
  const [preview, setPreview] = useState(value ?? '');
  const emitted = useRef(value ?? '');
  const seq = useRef(0);

  const emit = (v) => {
    emitted.current = v;
    onChange(v);
  };

  const convert = async (raw) => {
    const n = ++seq.current;
    const v = raw.trim();
    if (isShortMapLink(v)) {
      setStatus('loading');
      const url = await resolveShortLink(v).catch(() => null);
      if (n !== seq.current) return;
      setStatus(url ? 'idle' : 'unresolved');
      if (url) emit(url);
      return;
    }
    const url = toMapEmbed(v);
    setStatus(url === null ? 'error' : 'idle');
    if (url !== null) emit(url);
  };

  // Discard / reload replaced the value from outside → show it again.
  useEffect(() => {
    if ((value ?? '') === emitted.current) return;
    emitted.current = value ?? '';
    setText(value ?? '');
    setStatus('idle');
  }, [value]);

  // A share link saved before conversion existed → convert it now; saving stores the embed URL.
  useEffect(() => {
    if (isShortMapLink(value)) convert(value);
    // Once, for the value loaded from the database.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload the preview only once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setPreview(value ?? ''), 600);
    return () => clearTimeout(timer);
  }, [value]);

  const showPreview = status !== 'error' && status !== 'unresolved' && /^https:\/\//.test(preview) && !isShortMapLink(preview);

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          convert(e.target.value);
        }}
        placeholder={t('common.embedPlaceholder')}
        dir="ltr"
      />
      {status === 'loading' && (
        <p className="flex items-center gap-1.5 text-xs text-white/50">
          <Loader2 size={12} className="animate-spin" /> {t('common.mapResolving')}
        </p>
      )}
      {(status === 'error' || status === 'unresolved') && (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle size={12} className="shrink-0" /> {t(status === 'error' ? 'common.mapInvalid' : 'common.mapShortLink')}
        </p>
      )}
      {showPreview && <iframe title={t('common.mapPreview')} src={preview} className="map-dark h-48 w-full rounded-xl border border-white/10" loading="lazy" />}
    </div>
  );
}
