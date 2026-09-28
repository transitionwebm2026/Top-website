import Hero from '@/components/ui/Hero';
import AboutView from '@/components/about/AboutView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getDocuments, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('about_us');
}

export default async function AboutPage() {
  const [{ sections: s }, documents] = await Promise.all([getPage('about_us'), getDocuments()]);
  return (
    <>
      <Hero content={s.hero_section} compact />
      <AboutView sections={s} documents={documents} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
