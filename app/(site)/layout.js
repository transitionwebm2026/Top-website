import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { SiteProvider } from '@/components/providers/SiteProvider';
import SiteShell from '@/components/layout/SiteShell';
import SetupNotice from '@/components/layout/SetupNotice';
import { getDictionary, getSiteSettings } from '@/lib/cms/queries';

/**
 * Public site shell. Global settings and the UI dictionary (both languages) are
 * fetched at build time and handed to client components through context, which
 * refresh them from Supabase once the page loads.
 */
export default async function SiteLayout({ children }) {
  const [settings, dictionary] = await Promise.all([getSiteSettings(), getDictionary()]);

  // Supabase unreachable or the schema/seed not applied yet.
  if (!settings) return <SetupNotice />;

  return (
    <SiteProvider settings={settings}>
      <LanguageProvider dictionary={dictionary}>
        <SiteShell>{children}</SiteShell>
      </LanguageProvider>
    </SiteProvider>
  );
}
