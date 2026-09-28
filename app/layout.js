import { Cairo, Montserrat } from 'next/font/google';
import { getLang } from '@/lib/lang';
import { getSiteSettings } from '@/lib/cms/queries';
import ThemeStyle from '@/components/providers/ThemeStyle';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });

const safeUrl = (u) => {
  try {
    return new URL(u);
  } catch {
    return undefined;
  }
};

/** Site-wide <head> defaults, all from `site_settings`. */
export async function generateMetadata() {
  const [lang, s] = await Promise.all([getLang(), getSiteSettings()]);
  if (!s) return { title: 'TOP POWER' };
  const title = s.seo.title[lang] || s.name[lang];
  const description = s.seo.description[lang];
  return {
    metadataBase: safeUrl(s.seo.siteUrl),
    title: { default: title, template: `%s | ${s.name[lang]}` },
    description,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: {
      title,
      description,
      images: s.ogImage ? [s.ogImage] : undefined,
      locale: lang === 'en' ? 'en_US' : 'ar_EG',
    },
  };
}

export async function generateViewport() {
  const s = await getSiteSettings();
  return { themeColor: s?.theme.primary || '#153726' };
}

export default async function RootLayout({ children }) {
  // The site and the dashboard both follow the `tp-lang` cookie (Arabic by default).
  const [lang, settings] = await Promise.all([getLang(), getSiteSettings()]);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${cairo.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body>
        <ThemeStyle theme={settings?.theme} />
        {children}
      </body>
    </html>
  );
}
