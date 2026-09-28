import BlogsEditor from '@/components/admin/editors/BlogsEditor';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Blogs', ar: 'المدونة' });

export default function Page() {
  return <BlogsEditor />;
}
