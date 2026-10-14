'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import AccessDenied from './AccessDenied';
import AdminShell from './AdminShell';

/**
 * Dashboard gate. The site is static, so this runs in the browser:
 *  - no valid session → /admin/login?next=<requested path> (also after signing out, in any tab);
 *  - signed in but profiles.role ≠ 'admin' → AccessDenied.
 * The dashboard pages themselves are public files; the content is protected by
 * RLS, which applies the same admin rule to every query and upload.
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null); // { user, profile }

  useEffect(() => {
    const toLogin = () => router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
    if (!isSupabaseConfigured) return toLogin();

    const supabase = createClient();
    let alive = true;
    (async () => {
      // getUser() validates the JWT with Supabase Auth (never trust the stored session alone).
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) return toLogin();
      const { data: profile } = await supabase.from('profiles').select('id, email, full_name, avatar_url, role').eq('id', user.id).maybeSingle();
      if (alive) setSession({ user, profile });
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => event === 'SIGNED_OUT' && toLogin());
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
    // Checked once per visit (the layout persists across dashboard pages).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center" aria-busy="true">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
      </main>
    );
  }
  if (session.profile?.role !== 'admin') return <AccessDenied email={session.user.email} hasProfile={!!session.profile} />;
  return <AdminShell profile={session.profile}>{children}</AdminShell>;
}
