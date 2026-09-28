import LoginForm from '@/components/admin/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { adminMetadata } from '@/lib/admin/metadata';
import { getLang } from '@/lib/lang';

export const generateMetadata = () => adminMetadata({ en: 'Sign in', ar: 'تسجيل الدخول' });

export default async function LoginPage({ searchParams }) {
  const [{ next }, lang] = await Promise.all([searchParams, getLang()]);
  const safeNext = typeof next === 'string' && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
  return <LoginForm next={safeNext} configured={isSupabaseConfigured} initialLang={lang} />;
}
