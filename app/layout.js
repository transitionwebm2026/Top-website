import { Cairo, Montserrat } from 'next/font/google';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import SiteShell from '@/components/layout/SiteShell';
import { getLang } from '@/lib/lang';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });

export async function generateMetadata() {
  const en = (await getLang()) === 'en';
  return {
    metadataBase: new URL('https://example.com'),
    title: {
      default: en ? 'TOP POWER – MEP Engineering Supplies' : 'توب باور – مستلزمات هندسية MEP',
      template: en ? '%s | TOP POWER' : '%s | توب باور',
    },
    description: en
      ? 'TOP POWER supplies UL / FM / LPCB / VdS approved fire protection systems and MEP supplies in Egypt & KSA.'
      : 'توب باور – مورّد أنظمة الحماية من الحريق ومستلزمات MEP المعتمدة UL / FM / LPCB / VdS في مصر والسعودية.',
    icons: { icon: '/images/logo.jpg' },
    openGraph: {
      title: en ? 'TOP POWER – MEP Engineering Supplies' : 'توب باور – مستلزمات هندسية MEP',
      description: en ? 'UL / FM approved fire protection systems in Egypt & KSA.' : 'أنظمة حماية من الحريق معتمدة UL / FM في مصر والسعودية.',
      images: ['/images/logo-full.jpg'],
      locale: en ? 'en_US' : 'ar_EG',
    },
  };
}

export const viewport = {
  themeColor: '#153726',
};

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${cairo.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body>
        <LanguageProvider initialLang={lang}>
          <SiteShell>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
