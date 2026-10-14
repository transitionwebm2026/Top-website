// Static titles are in the default language (Arabic); the dashboard localizes the tab title in the browser.
export const metadata = {
  title: {
    default: 'لوحة التحكم',
    template: '%s · لوحة تحكم توب باور',
  },
  robots: { index: false, follow: false },
};

// Everything under /admin is gated in the browser by components/admin/AdminGuard.js
// (session + admin role) and by RLS on every query. The dashboard follows the
// same `tp-lang` cookie as the public site (Arabic by default).
export default function AdminRootLayout({ children }) {
  return children;
}
