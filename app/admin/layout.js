import { getLang } from '@/lib/lang';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return {
    title: {
      default: ar ? 'لوحة التحكم' : 'Control Panel',
      template: ar ? '%s · لوحة تحكم توب باور' : '%s · TOP POWER Admin',
    },
    robots: { index: false, follow: false },
  };
}

// Everything under /admin is gated by middleware.js (session) and by
// app/admin/(dashboard)/layout.js (admin role). The dashboard follows the same
// `tp-lang` cookie as the public site (Arabic by default).
export default function AdminRootLayout({ children }) {
  return children;
}
