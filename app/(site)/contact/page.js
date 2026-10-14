import ContactContent from '@/components/contact/ContactContent';
import { getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('contact_us');
}

export default async function ContactPage() {
  return <ContactContent initial={{ page: await getPage('contact_us') }} />;
}
