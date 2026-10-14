import CatalogsContent from '@/components/catalogs/CatalogsContent';
import { getCatalogs, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('catalogs');
}

export default async function CatalogPage() {
  const [page, catalogs] = await Promise.all([getPage('catalogs'), getCatalogs()]);
  return <CatalogsContent initial={{ page, catalogs }} />;
}
