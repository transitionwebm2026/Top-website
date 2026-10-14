'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import CatalogView from './CatalogView';

/** Products page; `initial` is the build-time content, refreshed from Supabase on load. */
export default function CatalogContent({ initial }) {
  const { page, catalog } = useLiveContent(initial, { page: live.page('market'), catalog: live.catalog(initial.catalog) });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} compact />
      <CatalogView products={catalog} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
