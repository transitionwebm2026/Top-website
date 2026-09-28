import HomeEditor from '@/components/admin/editors/HomeEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Home Page', ar: 'الصفحة الرئيسية' });

export default function Page() {
  return <HomeEditor />;
}
