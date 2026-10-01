'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLang } from '@/components/providers/LanguageProvider';
import ShapeIcon from './ShapeIcon';

/**
 * Product image, or — when no photo exists yet — a branded tile with a
 * line-art icon so the layout never shows a broken image.
 *
 * `fit="cover"` is for full-bleed photos (category covers): the photo fills the
 * frame edge to edge on a dark backdrop, with a soft vignette that blends it
 * into the card. `fit="contain"` (default) is for cut-out item shots on white:
 * they sit on a light studio backdrop and are multiply-blended into it, so the
 * photo's own white/off-white rectangle disappears instead of showing edges.
 *
 * Product photos are served as-is (`unoptimized`): no optimizer round-trip on
 * each switch, and the URLs match what ProductPageView preloads. A spinner sits
 * behind the image until it loads.
 */
export default function ProductVisual({ src, alt = '', icon = 'pipe', fit = 'contain', sizes = '400px', className = '', imgClassName, hover = true, note = true }) {
  const { t } = useLang();
  const [loadedSrc, setLoadedSrc] = useState(null);

  if (src) {
    const loaded = loadedSrc === src;
    const cover = fit === 'cover';
    return (
      <div
        className={`relative isolate overflow-hidden ${
          cover ? 'bg-emerald-night' : 'bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,#f4f6f5_50%,#dfe5e1_100%)]'
        } ${className}`}
      >
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
          className={`transition-[transform,opacity] duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${
            cover ? 'object-cover object-[50%_45%]' : `object-contain mix-blend-multiply ${imgClassName ?? 'p-4'}`
          } ${hover ? (cover ? 'group-hover:scale-105' : 'group-hover:scale-110') : ''}`}
        />
        {/* Vignette + hairline: blends the photo's edges into the dark card. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            cover
              ? 'bg-gradient-to-t from-emerald-ink/45 via-transparent to-emerald-ink/10 ring-1 ring-gold/15 ring-inset'
              : 'shadow-[inset_0_0_50px_rgba(12,34,24,0.10)] ring-1 ring-black/5 ring-inset'
          }`}
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
