'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import CatalogLibrary from './CatalogLibrary';

/** PDF catalogs page; `initial` is the build-time content, refreshed from Supabase on load. */
export default function CatalogsContent({ initial }) {
  const { page, catalogs } = useLiveContent(initial, { page: live.page('catalogs'), catalogs: live.catalogs });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} compact />
      <CatalogLibrary content={s.catalog_library} catalogs={catalogs} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
