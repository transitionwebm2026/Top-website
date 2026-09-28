import { getLang } from '@/lib/lang';

/** Browser-tab title for a dashboard page, in the dashboard language. */
export async function adminMetadata(title) {
  const lang = await getLang();
  return { title: title[lang] ?? title.en };
}
