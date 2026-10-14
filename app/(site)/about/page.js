import AboutContent from '@/components/about/AboutContent';
import { getDocuments, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('about_us');
}

export default async function AboutPage() {
  const [page, documents] = await Promise.all([getPage('about_us'), getDocuments()]);
  return <AboutContent initial={{ page, documents }} />;
}
