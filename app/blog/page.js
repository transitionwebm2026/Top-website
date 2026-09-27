import Hero from '@/components/ui/Hero';
import BlogView from '@/components/blog/BlogView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { localizedMetadata } from '@/lib/lang';

export function generateMetadata() {
  return localizedMetadata({
    ar: { title: 'المدونة', description: 'مقالات فنية عن أنظمة مكافحة الحريق والاعتمادات واختيار المواد.' },
    en: { title: 'Blog', description: 'Technical articles on fire protection systems, approvals and material selection.' },
  });
}

export default function BlogPage() {
  return (
    <>
      <Hero page="blog" image="/images/brochure/mech-pipe.jpg" compact />
      <BlogView />
      <PreFooterCTA />
    </>
  );
}
