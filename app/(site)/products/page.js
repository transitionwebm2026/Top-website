import CatalogContent from '@/components/products/CatalogContent';
import { getCatalog, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('market');
}

export default async function ProductsPage() {
  const [page, catalog] = await Promise.all([getPage('market'), getCatalog()]);
  return <CatalogContent initial={{ page, catalog }} />;
}
