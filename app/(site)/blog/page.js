import Hero from '@/components/ui/Hero';
import BlogView from '@/components/blog/BlogView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { getBlogs, getPage, pageMetadata } from '@/lib/cms/queries';

export function generateMetadata() {
  return pageMetadata('blogs');
}

export default async function BlogPage() {
  const [{ sections: s }, articles] = await Promise.all([getPage('blogs'), getBlogs()]);
  return (
    <>
      <Hero content={s.hero_section} compact />
      <BlogView articles={articles} gridHeading={s.blog_grid} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
