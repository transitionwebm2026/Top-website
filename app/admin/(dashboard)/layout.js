import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import AccessDenied from '@/components/admin/AccessDenied';
import { getCurrentAdmin } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';

// Second line of defence after middleware.js: the session must belong to a
// profile with role = 'admin'. (RLS enforces the same rule on every query.)
export default async function DashboardLayout({ children }) {
  const [{ user, profile, isAdmin }, lang] = await Promise.all([getCurrentAdmin(), getLang()]);
  if (!user) redirect('/admin/login');
  if (!isAdmin) return <AccessDenied email={user.email} hasProfile={!!profile} lang={lang} />;

  return (
    <AdminShell profile={profile} initialLang={lang}>
      {children}
    </AdminShell>
  );
}
