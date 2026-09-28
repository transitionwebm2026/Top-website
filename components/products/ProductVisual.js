'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLang } from '@/components/providers/LanguageProvider';
import ShapeIcon from './ShapeIcon';

/**
 * Product image on a white plate, or — when no photo exists yet — a branded
 * tile with a line-art icon so the layout never shows a broken image.
 *
 * Product photos are small pre-sized JPGs, so they are served as-is
 * (`unoptimized`): no optimizer round-trip on each switch, and the URLs match
 * what ProductPageView preloads. A spinner sits behind the image until it loads.
 */
export default function ProductVisual({ src, alt = '', icon = 'pipe', sizes = '400px', className = '', imgClassName = 'p-4', hover = true, note = true }) {
  const { t } = useLang();
  const [loadedSrc, setLoadedSrc] = useState(null);

  if (src) {
    const loaded = loadedSrc === src;
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        {!loaded && (
          <span className="absolute inset-0 grid place-items-center" aria-hidden>
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-mid/20 border-t-emerald-mid" />
          </span>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          onLoad={() => setLoadedSrc(src)}
          className={`object-contain ${imgClassName} ${hover ? 'transition-transform duration-700 group-hover:scale-110' : ''}`}
        />
      </div>
    );
  }
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-[#0c2218] ${className}`}>
      <div className="grid-texture absolute inset-0 opacity-60" />
      <div className="absolute h-2/3 w-2/3 rounded-full bg-gold/10 blur-2xl" />
      <ShapeIcon name={icon} className={`relative h-1/2 max-h-28 w-1/2 max-w-28 ${hover ? 'transition-transform duration-700 group-hover:scale-110' : ''}`} />
      {note && (
        <span className="absolute bottom-2.5 text-[0.65rem] font-semibold text-white/35">
          {t.common.photoSoon}
        </span>
      )}
    </div>
  );
}
