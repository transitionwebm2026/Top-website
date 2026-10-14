'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import ExperienceHighlight from './ExperienceHighlight';
import ProductBento from './ProductBento';
import BrandWall from './BrandWall';
import ProjectsShowcase from './ProjectsShowcase';

/** Home page; `initial` is the build-time content, refreshed from Supabase on load. */
export default function HomeContent({ initial }) {
  const { page, catalog, partners, projects } = useLiveContent(initial, {
    page: live.page('home'),
    catalog: live.catalog(initial.catalog),
    partners: live.partners,
    projects: live.projects,
  });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} zoom badges />
      <ExperienceHighlight content={s.about_summary} />
      <ProductBento content={s.bento_grid} products={catalog.filter((c) => c.showOnHome)} />
      <BrandWall content={s.partners_marquee} partners={partners} />
      <ProjectsShowcase content={s.key_projects} projects={projects} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
