'use client';

import { Newspaper, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { throwIf } from '@/lib/admin/hooks';
import { BLOG_STATUS, blogFields } from '@/lib/admin/collections';
import { revalidateCms } from '@/app/admin/actions';
import PageEditor from '../PageEditor';
import { useAdmin } from '../AdminContext';
import CollectionManager, { Muted } from '../CollectionManager';
import { useFeedback } from '../feedback';
import { Badge, Button } from '../ui';

/** Swap the hero article atomically (DB function, one transaction). */
async function makeHero(id) {
  const { error } = await createClient().rpc('set_hero_blog', { p_id: id });
  throwIf(error);
  await revalidateCms();
}

function ArticlesManager() {
  const { tr, locale } = useAdmin();
  const { toast, fail } = useFeedback();

  return (
    <CollectionManager
      table="blogs"
      title={{ en: 'Articles', ar: 'المقالات' }}
      description={{
        en: 'Markdown articles in Arabic and English. The hero article is featured at the top of the blog page.',
        ar: 'مقالات بالعربي والإنجليزي بصيغة Markdown. المقال المميز يظهر أعلى صفحة المدونة.',
      }}
      noun={{ en: 'article', ar: 'مقال' }}
      fields={blogFields}
      sortable={false}
      order={[['published_at', false]]}
      titleField="title"
      imageField="featured_image"
      defaults={{ status: 'draft', display: 'grid', read_time: 5, published_at: new Date().toISOString() }}
      context={{ folder: 'blog' }}
      // The unique "one hero" index would reject a second hero, so save as grid
      // first and promote afterwards with set_hero_blog().
      beforeSave={(payload, row, original) => (payload.display === 'hero' && original?.display !== 'hero' ? { ...payload, display: 'grid' } : payload)}
      afterSave={async (saved, row, api) => {
        if (row.display === 'hero' && saved.display !== 'hero') {
          await makeHero(saved.id);
          await api.reload();
        }
      }}
      columns={[
        {
          key: 'status',
          render: (r) => <Badge tone={r.status === 'published' ? 'green' : 'neutral'}>{tr(BLOG_STATUS.find((s) => s.value === r.status)?.label) || r.status}</Badge>,
        },
        {
          key: 'featured',
          render: (r) =>
            r.display === 'hero' && (
              <Badge tone="gold">
                <Star size={10} className="fill-current" /> {tr({ en: 'Hero', ar: 'مميز' })}
              </Badge>
            ),
        },
        { key: 'date', render: (r) => <Muted>{new Date(r.published_at).toLocaleDateString(locale)}</Muted> },
      ]}
      rowActions={(r, api) =>
        r.display !== 'hero' && (
          <Button
            size="sm"
            variant="ghost"
            icon={Star}
            className="hidden md:inline-flex"
            onClick={async () => {
              try {
                await makeHero(r.id);
                await api.reload();
                toast(tr({ en: 'Hero article updated', ar: 'تم تغيير المقال المميز' }));
              } catch (e) {
                fail(e);
              }
            }}
          >
            {tr({ en: 'Make hero', ar: 'اجعله مميزاً' })}
          </Button>
        )
      }
    />
  );
}

const TABS = [
  { id: 'articles', label: { en: 'Articles', ar: 'المقالات' }, render: () => <ArticlesManager /> },
  { id: 'hero', label: { en: 'Blog Page Hero', ar: 'واجهة صفحة المدونة' }, sections: ['hero_section'], hideFields: ['badges'] },
  { id: 'grid', label: { en: 'Grid Heading', ar: 'عنوان الشبكة' }, sections: ['blog_grid'] },
  { id: 'cta', label: { en: 'Pre-footer CTA', ar: 'دعوة التواصل' }, sections: ['pre_footer_cta'] },
];

export default function BlogsEditor() {
  return (
    <PageEditor
      slug="blogs"
      icon={Newspaper}
      title={{ en: 'Blogs Manager', ar: 'إدارة المدونة' }}
      description={{ en: 'Write articles and choose the featured hero post.', ar: 'اكتب المقالات واختر المقال المميز.' }}
      tabs={TABS}
    />
  );
}
