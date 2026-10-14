import LoginForm from '@/components/admin/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { adminMetadata } from '@/lib/admin/metadata';

export const generateMetadata = () => adminMetadata({ en: 'Sign in', ar: 'تسجيل الدخول' });

export default function LoginPage() {
  return <LoginForm configured={isSupabaseConfigured} />;
}
