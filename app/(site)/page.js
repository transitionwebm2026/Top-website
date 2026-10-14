import HomeContent from '@/components/home/HomeContent';
import { getCatalog, getPage, getPartners, getProjects, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('home');
}

export default async function HomePage() {
  const [page, catalog, partners, projects] = await Promise.all([getPage('home'), getCatalog(), getPartners(), getProjects()]);
  return <HomeContent initial={{ page, catalog, partners, projects }} />;
}
