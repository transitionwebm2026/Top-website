'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL, assertConfigured } from './config';

let client;

/**
 * Browser client (singleton). Carries the admin's session cookie, so every
 * dashboard query runs under that user's Row Level Security policies.
 */
export function createClient() {
  assertConfigured();
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
