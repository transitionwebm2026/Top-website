'use server';

import { revalidateTag } from 'next/cache';
import { getCurrentAdmin } from '@/lib/supabase/server';
import { CMS_TAG } from '@/lib/cms/constants';

/**
 * Purges the public-site content cache after a dashboard edit, so changes are
 * live on the next page load. Admin-only: the caller's session is re-verified.
 */
export async function revalidateCms() {
  const { isAdmin } = await getCurrentAdmin();
  if (!isAdmin) return { ok: false };
  revalidateTag(CMS_TAG);
  return { ok: true };
}
