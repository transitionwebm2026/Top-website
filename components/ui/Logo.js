'use client';

import Image from 'next/image';
import { useLang } from '@/components/providers/LanguageProvider';
import { useSite } from '@/components/providers/SiteProvider';

/**
 * `size` sets a fixed mark size (px). `responsive` shrinks the mark and wordmark
 * on phones so the navbar always fits. Mark, wordmark and tagline come from site settings.
 */
export default function Logo({ size = 48, withText = true, responsive = false }) {
  const { pick } = useLang();
  const { logo, logoText, tagline } = useSite();
  return (
    <span className={`group inline-flex min-w-0 items-center ${responsive ? 'gap-2 sm:gap-3' : 'gap-3'}`}>
      {logo && (
        <span
          className={`hex-clip-v relative block shrink-0 transition duration-500 group-hover:drop-shadow-[0_0_18px_rgba(205,176,116,0.8)] ${
            responsive ? 'h-[38px] w-[34px] sm:h-[45px] sm:w-10' : ''
          }`}
          style={responsive ? undefined : { width: size, height: size * 1.12 }}
        >
          <Image src={logo} alt={logoText} fill sizes={`${size * 2}px`} className="object-cover" priority />
        </span>
      )}
      {withText && (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={`text-gold-gradient font-[family-name:var(--font-montserrat)] font-extrabold tracking-wide whitespace-nowrap ${
              responsive ? 'text-[0.95rem] sm:text-lg' : 'text-lg'
            }`}
          >
            {logoText}
          </span>
          <span
            className={`mt-1 truncate font-medium text-white/60 ${
              responsive ? 'text-[0.6rem] tracking-normal sm:text-[0.68rem] sm:tracking-wider' : 'text-[0.68rem] tracking-wider'
            }`}
          >
            {pick(tagline)}
          </span>
        </span>
      )}
    </span>
  );
}
