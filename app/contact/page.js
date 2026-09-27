import Hero from '@/components/ui/Hero';
import ContactView from '@/components/contact/ContactView';
import PreFooterCTA from '@/components/layout/PreFooterCTA';
import { localizedMetadata } from '@/lib/lang';

export function generateMetadata() {
  return localizedMetadata({
    ar: { title: 'اتصل بنا', description: 'تواصل مع توب باور – القاهرة، الأزبكية، 23 شارع عماد الدين.' },
    en: { title: 'Contact Us', description: 'Contact TOP POWER – 23 Emad El-Din St., Azbakeya, Cairo.' },
  });
}

export default function ContactPage() {
  return (
    <>
      <Hero page="contact" image="/images/brochure/mech-valves.jpg" compact />
      <ContactView />
      <PreFooterCTA />
    </>
  );
}
