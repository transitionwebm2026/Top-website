import Hero from '@/components/ui/Hero';
import ExperienceHighlight from '@/components/home/ExperienceHighlight';
import ProductBento from '@/components/home/ProductBento';
import BrandMarquee from '@/components/home/BrandMarquee';
import ProjectsShowcase from '@/components/home/ProjectsShowcase';
import PreFooterCTA from '@/components/layout/PreFooterCTA';

export default function HomePage() {
  return (
    <>
      <Hero page="home" image="/images/cover.jpg" zoom badges />
      <ExperienceHighlight />
      <ProductBento />
      <BrandMarquee />
      <ProjectsShowcase />
      <PreFooterCTA />
    </>
  );
}
