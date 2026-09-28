import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL, assertConfigured } from './config';

/**
 * Per-request server client bound to the visitor's auth cookies. Use it in
 * Server Components, Route Handlers and Server Actions that act as the
 * signed-in user (dashboard guards, revalidation).
 */
export async function createClient() {
  assertConfigured();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The middleware refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in user and their profile, or nulls. Verifies the JWT with Supabase Auth. */
export async function getCurrentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false };

  const { data: profile } = await supabase.from('profiles').select('id, email, full_name, avatar_url, role').eq('id', user.id).maybeSingle();
  return { user, profile, isAdmin: profile?.role === 'admin' };
}
