import ContactEditor from '@/components/admin/editors/ContactEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Contact & Enquiries', ar: 'التواصل والاستفسارات' });

export default function Page() {
  return <ContactEditor />;
}
