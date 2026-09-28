import Hero from '@/components/ui/Hero';
import ExperienceHighlight from '@/components/home/ExperienceHighlight';
import ProductBento from '@/components/home/ProductBento';
import BrandMarquee from '@/components/home/BrandMarquee';
import ProjectsShowcase from '@/components/home/ProjectsShowcase';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getCatalog, getPage, getPartners, getProjects, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('home');
}

export default async function HomePage() {
  const [{ sections: s }, catalog, partners, projects] = await Promise.all([getPage('home'), getCatalog(), getPartners(), getProjects()]);
  return (
    <>
      <Hero content={s.hero_section} zoom badges />
      <ExperienceHighlight content={s.about_summary} />
      <ProductBento content={s.bento_grid} products={catalog.filter((c) => c.showOnHome)} />
      <BrandMarquee content={s.partners_marquee} partners={partners} />
      <ProjectsShowcase content={s.key_projects} projects={projects} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
