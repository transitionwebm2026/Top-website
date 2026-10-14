import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, assertConfigured } from './config';

let client;

/**
 * Cookie-less anonymous client for public content, used at build time and in
 * the visitor's browser (live content refresh, contact form). RLS limits it to
 * published rows and to inserting contact messages.
 */
export function createPublicClient() {
  assertConfigured();
  client ??= createSupabaseClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
