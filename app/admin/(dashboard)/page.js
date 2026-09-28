import Overview from '@/components/admin/editors/Overview';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Overview', ar: 'نظرة عامة' });

export default function Page() {
  return <Overview />;
}
