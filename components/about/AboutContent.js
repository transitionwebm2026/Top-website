'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import AboutView from './AboutView';

/** About page; `initial` is the build-time content, refreshed from Supabase on load. */
export default function AboutContent({ initial }) {
  const { page, documents } = useLiveContent(initial, { page: live.page('about_us'), documents: live.documents });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} compact />
      <AboutView sections={s} documents={documents} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
