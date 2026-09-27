import Hero from '@/components/ui/Hero';
import CatalogView from '@/components/products/CatalogView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { localizedMetadata } from '@/lib/lang';

export function generateMetadata() {
  return localizedMetadata({
    ar: { title: 'المنتجات والكتالوج', description: 'مواسير سيملس، وصلات، محابس، رشاشات وصناديق حريق معتمدة UL / FM.' },
    en: { title: 'Products & Catalog', description: 'Seamless pipes, fittings, valves, sprinklers and fire cabinets – UL / FM approved.' },
  });
}

export default function ProductsPage() {
  return (
    <>
      <Hero page="products" image="/images/brochure/mech-grooved.jpg" compact />
      <CatalogView />
      <PreFooterCTA />
    </>
  );
}
