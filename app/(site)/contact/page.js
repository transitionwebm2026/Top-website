import Hero from '@/components/ui/Hero';
import ContactView from '@/components/contact/ContactView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('contact_us');
}

export default async function ContactPage() {
  const { sections: s } = await getPage('contact_us');
  return (
    <>
      <Hero content={s.hero_section} compact />
      <ContactView content={s.contact_form} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
