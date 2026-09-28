import Hero from '@/components/ui/Hero';
import CatalogView from '@/components/products/CatalogView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getCatalog, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('market');
}

export default async function ProductsPage() {
  const [{ sections: s }, catalog] = await Promise.all([getPage('market'), getCatalog()]);
  return (
    <>
      <Hero content={s.hero_section} compact />
      <CatalogView products={catalog} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
