import CatalogsEditor from '@/components/admin/editors/CatalogsEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Catalogs', ar: 'الكتالوجات' });

export default function Page() {
  return <CatalogsEditor />;
}
