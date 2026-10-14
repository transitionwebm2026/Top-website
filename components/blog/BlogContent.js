'use client';

import Hero from '@/components/ui/Hero';
import PageTitle from '@/components/layout/PageTitle';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { live, useLiveContent } from '@/lib/cms/live';
import BlogView from './BlogView';

/**
 * Blog page; `initial` is the build-time content, refreshed from Supabase on
 * load — which is also when scheduled articles reach their publish date.
 */
export default function BlogContent({ initial }) {
  const { page, articles } = useLiveContent(initial, { page: live.page('blogs'), articles: live.blogs });
  const s = page.sections;
  return (
    <>
      <PageTitle title={page.meta?.title} />
      <Hero content={s.hero_section} compact />
      <BlogView articles={articles} gridHeading={s.blog_grid} />
      <PreFooterCTA content={s.pre_footer_cta} />
    </>
  );
}
