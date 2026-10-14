'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import ContactView from './ContactView';

/** Contact page; `initial` is the build-time content, refreshed from Supabase on load. */
export default function ContactContent({ initial }) {
  const { page } = useLiveContent(initial, { page: live.page('contact_us') });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} compact />
      <ContactView content={s.contact_form} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
