import AboutEditor from '@/components/admin/editors/AboutEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'About Us', ar: 'من نحن' });

export default function Page() {
  return <AboutEditor />;
}
