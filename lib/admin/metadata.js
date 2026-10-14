import { DEFAULT_LANG } from '@/lib/lang';

/** Browser-tab title for a dashboard page in the default language (AdminShell localizes it in the browser). */
export function adminMetadata(title) {
  return { title: title[DEFAULT_LANG] ?? title.en };
}
