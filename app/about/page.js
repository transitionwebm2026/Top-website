import Hero from '@/components/ui/Hero';
import AboutView from '@/components/about/AboutView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { localizedMetadata } from '@/lib/lang';

export function generateMetadata() {
  return localizedMetadata({
    ar: { title: 'من نحن', description: 'أكثر من 20 عاماً في توريد أنظمة الحماية من الحريق المعتمدة في مصر والسعودية.' },
    en: { title: 'About Us', description: '20+ years supplying approved fire protection systems in Egypt and KSA.' },
  });
}

export default function AboutPage() {
  return (
    <>
      <Hero page="about" image="/images/about-team.jpg" compact />
      <AboutView />
      <PreFooterCTA />
    </>
  );
}
