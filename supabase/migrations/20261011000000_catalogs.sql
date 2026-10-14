-- =============================================================================
-- Catalog page (/catalog): manufacturers' PDF catalogs, browsed in an on-page
-- flipbook or downloaded.
--
-- · `catalogs` table, edited in Dashboard → Catalogs (the cover image, page
--   count and file size are read from the PDF when it's saved). Each catalog
--   can belong to a product line: product pages list every catalog, their
--   line's first.
-- · `catalogs` page with its hero, library heading and pre-footer CTA.
-- · Viewer and product-page texts (`catalog.*` translations).
-- · Navbar & footer: "Products & Catalog" becomes "Products", followed by a
--   new "Catalog" link.
-- · The first two catalogs (MECH sprinklers, INTERPIPE pipes), shipped in
--   public/catalogs/.
-- Safe to re-run: dashboard edits are kept.
-- =============================================================================
begin;

-- -----------------------------------------------------------------------------
-- 1. Table
-- -----------------------------------------------------------------------------
create table if not exists public.catalogs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),  -- direct link: /catalog/#<slug>
  title_ar        text not null,
  title_en        text not null,
  description_ar  text,
  description_en  text,
  category_ar     text,          -- product line, shown as a tag
  category_en     text,
  brand           text,
  file_url        text not null, -- the PDF
  cover_url       text,          -- made from the first page when left empty
  page_count      integer check (page_count is null or page_count > 0),
  file_size       bigint check (file_size is null or file_size > 0),  -- bytes
  sort_order      integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists catalogs_sort_idx on public.catalogs (sort_order);

-- Product line whose page shows the catalog first (also added to a table made by an earlier run).
alter table public.catalogs
  add column if not exists category_id uuid references public.product_categories (id) on delete set null;

drop trigger if exists catalogs_touch on public.catalogs;
create trigger catalogs_touch before update on public.catalogs
  for each row execute function public.touch_updated_at();

alter table public.catalogs enable row level security;
drop policy if exists "catalogs: public read" on public.catalogs;
drop policy if exists "catalogs: admin all"   on public.catalogs;
create policy "catalogs: public read" on public.catalogs for select to anon, authenticated
  using (is_published);
create policy "catalogs: admin all"   on public.catalogs for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.catalogs to anon, authenticated;
grant insert, update, delete on public.catalogs to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Page + sections
-- -----------------------------------------------------------------------------
insert into public.pages (slug, path, title_ar, title_en, meta_title_ar, meta_title_en, meta_description_ar, meta_description_en, sort_order)
values (
  'catalogs', '/catalog', 'الكتالوج', 'Catalog', 'الكتالوج', 'Catalog',
  'تصفح كتالوجات رشاشات الحريق والمواسير من المصانع العالمية التي تمثلها توب باور، أو حمّلها بصيغة PDF.',
  'Browse fire sprinkler and pipe catalogs from the manufacturers TOP POWER represents, or download them as PDF.',
  5
)
on conflict (slug) do nothing;

insert into public.sections (page_id, key, type, label, sort_order)
select p.id, s.key, s.type, s.label, s.sort_order
from public.pages p
cross join (values
  ('hero_section', 'hero', 'Hero Section', 0),
  ('catalog_library', 'heading', 'Catalog Library Heading', 1),
  ('pre_footer_cta', 'cta', 'Pre-footer CTA', 2)
) as s (key, type, label, sort_order)
where p.slug = 'catalogs'
on conflict (page_id, key) do nothing;

insert into public.section_content (section_id, content_ar, content_en)
select s.id, c.content_ar, c.content_en
from public.sections s
join public.pages p on p.id = s.page_id and p.slug = 'catalogs'
join (values
  (
    'hero_section',
    '{"title":"كتالوجات منتجاتنا","title_highlight":"تصفّحها صفحة بصفحة","description":"كتالوجات المصانع التي نمثلها كما هي: المواصفات وجداول المقاسات والموديلات، تتصفحها هنا أو تحمّلها بصيغة PDF.","image":"/images/brochure/mech-sprinkler.jpg","cta_primary_label":"تواصل معنا","cta_primary_href":"/contact","cta_secondary_label":"استكشف منتجاتنا","cta_secondary_href":"/products","badges":[]}'::jsonb,
    '{"title":"Our Product Catalogs","title_highlight":"Page by Page","description":"The original catalogs of the manufacturers we represent: specifications, size tables and models — browse them here or download them as PDF.","image":"/images/brochure/mech-sprinkler.jpg","cta_primary_label":"Contact Us","cta_primary_href":"/contact","cta_secondary_label":"Explore Our Products","cta_secondary_href":"/products","badges":[]}'::jsonb
  ),
  (
    'catalog_library',
    '{"eyebrow":"مكتبة الكتالوجات","title":"اختر كتالوجاً وابدأ التصفح","description":""}'::jsonb,
    '{"eyebrow":"Catalog Library","title":"Pick a catalog and start browsing","description":""}'::jsonb
  ),
  (
    'pre_footer_cta',
    '{"title":"جاهز تبدأ مشروعك القادم؟","description":"احصل على عرض سعر لمواسير، وصلات، محابس ورشاشات معتمدة مع توفر فوري من المخزون.","whatsapp_label":"واتساب","call_label":"اتصل بنا"}'::jsonb,
    '{"title":"Ready to start your next project?","description":"Get a quotation for certified pipes, fittings, valves and sprinklers with immediate stock availability.","whatsapp_label":"WhatsApp","call_label":"Call Us Now"}'::jsonb
  )
) as c (key, content_ar, content_en) on c.key = s.key
on conflict (section_id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Viewer texts (also in supabase/seed.sql)
-- -----------------------------------------------------------------------------
insert into public.translations (key, value_ar, value_en) values
  ('nav.catalog', 'الكتالوج', 'Catalog'),
  ('catalog.browse', 'تصفّح', 'Browse'),
  ('catalog.download', 'تحميل', 'Download'),
  ('catalog.pages', 'الصفحات', 'Pages'),
  ('catalog.size', 'الحجم', 'Size'),
  ('catalog.format', 'الصيغة', 'Format'),
  ('catalog.page', 'صفحة {page}', 'Page {page}'),
  ('catalog.pageOf', 'صفحة {page} من {total}', 'Page {page} of {total}'),
  ('catalog.loading', 'جاري فتح الكتالوج…', 'Opening the catalog…'),
  ('catalog.error', 'تعذّر عرض الكتالوج هنا. يمكنك تحميله وفتحه على جهازك.', 'This catalog can’t be shown here. You can download it and open it on your device.'),
  ('catalog.zoomIn', 'تكبير', 'Zoom in'),
  ('catalog.zoomOut', 'تصغير', 'Zoom out'),
  ('catalog.fullscreen', 'ملء الشاشة', 'Full screen'),
  ('catalog.exitFullscreen', 'الخروج من ملء الشاشة', 'Exit full screen'),
  ('catalog.hint', 'اسحب الصفحة أو استخدم الأسهم للتقليب', 'Swipe the page or use the arrows to turn it'),
  ('catalog.empty', 'لا توجد كتالوجات منشورة بعد.', 'No catalogs published yet.'),
  ('catalog.showcaseTitle', 'كتالوجات المنتجات بصيغة PDF', 'Product Catalogs in PDF'),
  ('catalog.showcaseDesc', 'المواصفات وجداول المقاسات والموديلات من كتالوجات المصانع مباشرة: تصفّحها هنا صفحة بصفحة أو حمّلها على جهازك.', 'Specifications, size tables and models straight from the manufacturers’ catalogs — browse them here page by page or download them.'),
  ('catalog.forLine', 'كتالوج هذا الخط', 'For this product line'),
  ('catalog.choose', 'اختر كتالوجاً', 'Choose a catalog'),
  ('catalog.all', 'كل الكتالوجات', 'All catalogs')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- 4. "Products & Catalog" → "Products" (where it still has the original name)
-- -----------------------------------------------------------------------------
update public.pages set title_ar = 'المنتجات' where slug = 'market' and title_ar = 'المنتجات والكتالوج';
update public.pages set title_en = 'Products' where slug = 'market' and title_en = 'Products & Catalog';
update public.pages set meta_title_ar = 'المنتجات' where slug = 'market' and meta_title_ar = 'المنتجات والكتالوج';
update public.pages set meta_title_en = 'Products' where slug = 'market' and meta_title_en = 'Products & Catalog';
update public.translations set value_ar = 'المنتجات' where key = 'nav.products' and value_ar = 'المنتجات والكتالوج';
update public.translations set value_en = 'Products' where key = 'nav.products' and value_en = 'Products & Catalog';

-- Navbar / footer links: rename the products link, then add the catalog link
-- right after it (at the end when there is no products link). A list that
-- already links to /catalog is left as it is.
create or replace function pg_temp.with_catalog_link(links jsonb)
returns jsonb
language sql
as $$
  with items as (
    select case
             when l ->> 'href' in ('/products', '/products/') then
               l || jsonb_build_object(
                 'label_ar', case when l ->> 'label_ar' = 'المنتجات والكتالوج' then 'المنتجات' else l ->> 'label_ar' end,
                 'label_en', case when l ->> 'label_en' = 'Products & Catalog' then 'Products' else l ->> 'label_en' end)
             else l
           end as link,
           i::numeric as pos
    from jsonb_array_elements(links) with ordinality as e (l, i)
  ),
  added as (
    select '{"label_ar":"الكتالوج","label_en":"Catalog","href":"/catalog","visible":true}'::jsonb as link,
           coalesce((select min(pos) from items where link ->> 'href' in ('/products', '/products/')),
                    (select max(pos) from items), 0) + 0.5 as pos
    where not exists (select 1 from items where link ->> 'href' in ('/catalog', '/catalog/'))
  )
  select coalesce(jsonb_agg(link order by pos), '[]'::jsonb)
  from (select * from items union all select * from added) all_links
$$;

update public.site_settings set
  nav_links = pg_temp.with_catalog_link(nav_links),
  footer_links = pg_temp.with_catalog_link(footer_links)
where id = 1;

-- -----------------------------------------------------------------------------
-- 5. First catalogs (only when the table is empty)
-- -----------------------------------------------------------------------------
insert into public.catalogs (
  slug, title_ar, title_en, description_ar, description_en, category_ar, category_en, brand,
  category_id, file_url, cover_url, page_count, file_size, sort_order
)
select v.slug, v.title_ar, v.title_en, v.description_ar, v.description_en, v.category_ar, v.category_en, v.brand,
       (select id from public.product_categories where slug = v.line), v.file_url, v.cover_url, v.page_count, v.file_size, v.sort_order
from (values
  (
    'mech-fire-sprinklers', 'كتالوج رشاشات الحريق MECH', 'MECH Fire Sprinkler Catalog',
    'رشاشات K80 وK115 وK161 بأنواعها القائم والمتدلي والجانبي، بسرعات استجابة مختلفة، مع جداول الموديلات ودرجات حرارة التشغيل.',
    'K80, K115 and K161 sprinklers in upright, pendant and sidewall types with quick, standard and special response — model tables and operating temperatures.',
    'رشاشات الحريق', 'Fire Sprinklers', 'MECH', 'sprinklers',
    '/catalogs/mech-fire-sprinklers.pdf', '/images/catalogs/mech-fire-sprinklers.jpg', 7, 2851699::bigint, 0
  ),
  (
    'interpipe-pipes', 'كتالوج مواسير INTERPIPE', 'INTERPIPE Pipe Catalog',
    'مواسير سيملس وفق ASTM A106 / A53: الأقطار وسماكات الجدار والأوزان حسب ANSI/ASME B36.10M.',
    'Seamless pipes to ASTM A106 / A53: outside diameters, wall thicknesses and weights per ANSI/ASME B36.10M.',
    'المواسير', 'Pipes', 'INTERPIPE', 'pipes',
    '/catalogs/interpipe-pipes.pdf', '/images/catalogs/interpipe-pipes.jpg', 6, 480188::bigint, 1
  )
) v (slug, title_ar, title_en, description_ar, description_en, category_ar, category_en, brand, line, file_url, cover_url, page_count, file_size, sort_order)
where not exists (select 1 from public.catalogs);

commit;
