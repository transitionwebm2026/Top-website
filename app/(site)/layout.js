import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { SiteProvider } from '@/components/providers/SiteProvider';
import SiteShell from '@/components/layout/SiteShell';
import SetupNotice from '@/components/layout/SetupNotice';
import { getLang } from '@/lib/lang';
import { getDictionary, getSiteSettings } from '@/lib/cms/queries';

/**
 * Public site shell. Global settings and the UI dictionary (both languages) are
 * fetched once on the server and handed to client components through context.
 */
export default async function SiteLayout({ children }) {
  const [lang, settings, dictionary] = await Promise.all([getLang(), getSiteSettings(), getDictionary()]);

  // Supabase unreachable or the schema/seed not applied yet.
  if (!settings) return <SetupNotice />;

  return (
    <SiteProvider settings={settings}>
      <LanguageProvider initialLang={lang} dictionary={dictionary}>
        <SiteShell>{children}</SiteShell>
      </LanguageProvider>
    </SiteProvider>
  );
}
