import BlogContent from '@/components/blog/BlogContent';
import { getBlogs, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('blogs');
}

export default async function BlogPage() {
  const [page, articles] = await Promise.all([getPage('blogs'), getBlogs()]);
  return <BlogContent initial={{ page, articles }} />;
}
