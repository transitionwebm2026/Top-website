import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config';

const LOGIN = '/admin/login';

/**
 * Route guard for the dashboard.
 *  - Refreshes the Supabase session cookie on every admin request.
 *  - No valid session → redirect to /admin/login?next=<requested path>.
 *  - Signed in and visiting the login page → go to the dashboard.
 *  - /dashboard/* is an alias of /admin/*.
 * The admin *role* is checked again in app/admin/(dashboard)/layout.js and by
 * RLS on every query, so a valid session alone never grants write access.
 */
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, '/admin');
    return NextResponse.redirect(url);
  }

  const isLogin = pathname === LOGIN;
  if (!isSupabaseConfigured) {
    return isLogin ? NextResponse.next() : redirectTo(request, LOGIN);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getUser() validates the JWT against Supabase Auth (never trust the cookie alone).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    return redirectTo(request, LOGIN, { next: pathname + search }, response);
  }
  if (user && isLogin) {
    const next = request.nextUrl.searchParams.get('next');
    return redirectTo(request, safeNext(next), {}, response);
  }
  return response;
}

/** Only allow same-site dashboard paths as post-login targets. */
function safeNext(next) {
  return next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
}

function redirectTo(request, pathname, params = {}, carry) {
  const url = request.nextUrl.clone();
  const [path, query = ''] = pathname.split('?');
  url.pathname = path;
  url.search = query ? `?${query}` : '';
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = NextResponse.redirect(url);
  // Keep any refreshed session cookies on the redirect.
  carry?.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/dashboard'],
};
