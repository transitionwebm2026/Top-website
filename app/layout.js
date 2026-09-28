import { Cairo, Montserrat } from 'next/font/google';
import { getLang } from '@/lib/lang';
import { getSiteSettings } from '@/lib/cms/queries';
import { ogImage, siteOrigin, socialMeta } from '@/lib/cms/seo';
import ThemeStyle from '@/components/providers/ThemeStyle';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });

/** Site-wide <head> defaults, all from `site_settings`, incl. the link-preview image. */
export async function generateMetadata() {
  const [lang, s] = await Promise.all([getLang(), getSiteSettings()]);
  const metadataBase = await siteOrigin(s?.seo.siteUrl);
  if (!s) return { metadataBase, title: 'TOP POWER', ...socialMeta({ title: 'TOP POWER', image: ogImage(null, 'TOP POWER'), lang }) };

  const title = s.seo.title[lang] || s.name[lang];
  const description = s.seo.description[lang];
  return {
    metadataBase,
    title: { default: title, template: `%s | ${s.name[lang]}` },
    description,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    ...socialMeta({ title, description, image: ogImage(s.ogImage, s.name[lang]), siteName: s.name[lang], lang }),
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
