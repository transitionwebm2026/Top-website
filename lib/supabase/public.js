import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, assertConfigured } from './config';

let client;

/**
 * Cookie-less anonymous client for public content. Because it never touches the
 * request, its results can be cached across visitors (see lib/cms/queries.js).
 * RLS limits it to published rows.
 */
export function createPublicClient() {
  assertConfigured();
  client ??= createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
