-- =============================================================================
-- TOP POWER — Headless CMS schema
-- -----------------------------------------------------------------------------
-- Tables, helper functions, triggers, Row Level Security and Storage.
-- Run once (Supabase SQL Editor, `supabase db push`, or the Supabase MCP),
-- then run `supabase/seed.sql` for the default content.
--
-- Access model
--   * anon / any visitor   → SELECT published content only; INSERT contact messages.
--   * authenticated admin  → full CRUD on everything (profiles.role = 'admin').
--   * other signed-in users → same as anon (role 'viewer' until promoted).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

-- Keeps `updated_at` current on every UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- 1. PROFILES (admins)
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        text not null default 'viewer' check (role in ('admin', 'viewer')),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is 'Dashboard users. Only role = admin may write CMS content.';

-- True when the current JWT belongs to a CMS admin.
-- SECURITY DEFINER so it can read profiles without recursing into profiles' RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Every new auth user gets a profile with no privileges. Promote with:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- API users (anon/authenticated) can only change roles when they are admins, so
-- nobody can promote themselves. Direct database access (SQL Editor = postgres,
-- service_role) is unrestricted, which is how the first admin is bootstrapped.
-- SECURITY INVOKER on purpose: `current_user` must be the caller's role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated')
     and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- =============================================================================
-- 2. PAGES
-- =============================================================================
create table if not exists public.pages (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique check (slug ~ '^[a-z0-9_]+$'),
  path                 text not null,                -- public route, e.g. '/about'
  title_ar             text not null default '',
  title_en             text not null default '',
  meta_title_ar        text,
  meta_title_en        text,
  meta_description_ar  text,
  meta_description_en  text,
  og_image             text,
  is_published         boolean not null default true,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table public.pages is 'Site pages master table: home, about_us, market, blogs, contact_us.';

-- =============================================================================
-- 3. SECTIONS
-- =============================================================================
create table if not exists public.sections (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references public.pages (id) on delete cascade,
  key          text not null check (key ~ '^[a-z0-9_]+$'),  -- e.g. 'hero_section'
  type         text not null,                                -- editor/renderer schema, e.g. 'hero'
  label        text not null default '',                     -- dashboard display name
  sort_order   integer not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (page_id, key)
);
create index if not exists sections_page_idx on public.sections (page_id, sort_order);

-- =============================================================================
-- 4. SECTION CONTENT  (one bilingual JSON document per section)
-- -----------------------------------------------------------------------------
-- content_ar / content_en hold the same keys; the frontend reads
-- content_<lang> directly, so switching language needs no extra request.
-- Language-neutral values (images, links, numbers) are mirrored in both.
-- =============================================================================
create table if not exists public.section_content (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null unique references public.sections (id) on delete cascade,
  content_ar  jsonb not null default '{}'::jsonb check (jsonb_typeof(content_ar) = 'object'),
  content_en  jsonb not null default '{}'::jsonb check (jsonb_typeof(content_en) = 'object'),
  updated_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- 5. PRODUCT CATEGORIES  (the 5 product lines)
-- =============================================================================
create table if not exists public.product_categories (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  icon                text not null default 'pipe',
  name_ar             text not null,
  name_en             text not null,
  short_ar            text,
  short_en            text,
  description_ar      text,
  description_en      text,
  cover_image         text,
  certs               text[] not null default '{}',
  standards           text,
  sizes_label_ar      text,
  sizes_label_en      text,
  pressure_label_ar   text,
  pressure_label_en   text,
  brands              jsonb not null default '[]'::jsonb,  -- [{name_ar, name_en}]
  specs               jsonb not null default '[]'::jsonb,  -- [{label_ar, label_en, value_ar, value_en}]
  items_ar            text[] not null default '{}',
  items_en            text[] not null default '{}',
  applications_ar     text[] not null default '{}',
  applications_en     text[] not null default '{}',
  brochure            text[] not null default '{}',        -- catalog page images
  show_on_home        boolean not null default true,
  sort_order          integer not null default 0,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (jsonb_typeof(brands) = 'array' and jsonb_typeof(specs) = 'array')
);

-- =============================================================================
-- 6. PRODUCTS  (sub-types inside a category, each with brands/shapes/sizes)
-- =============================================================================
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.product_categories (id) on delete restrict,
  slug            text not null check (slug ~ '^[a-z0-9-]+$'),
  icon            text not null default 'pipe',
  name_ar         text not null,
  name_en         text not null,
  description_ar  text,
  description_en  text,
  cover_image     text,
  gallery         text[] not null default '{}',
  sizes           text[] not null default '{}',
  pressure_ar     text,
  pressure_en     text,
  standard        text,
  specs           jsonb not null default '[]'::jsonb,  -- [{label_ar, label_en, value_ar, value_en}]
  shapes          jsonb not null default '[]'::jsonb,  -- [{key, image}]
  brands          jsonb not null default '[]'::jsonb,  -- [{name_ar, name_en, logo, image, desc_ar, desc_en, datasheet, is_primary}]
  sort_order      integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (category_id, slug),
  check (jsonb_typeof(specs) = 'array' and jsonb_typeof(shapes) = 'array' and jsonb_typeof(brands) = 'array')
);
create index if not exists products_category_idx on public.products (category_id, sort_order);

-- =============================================================================
-- 7. BLOGS
-- =============================================================================
create table if not exists public.blogs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_ar        text not null,
  title_en        text not null,
  excerpt_ar      text,
  excerpt_en      text,
  body_ar         text not null default '',   -- Markdown
  body_en         text not null default '',   -- Markdown
  category_ar     text,
  category_en     text,
  featured_image  text,
  display         text not null default 'grid' check (display in ('hero', 'grid')),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz not null default now(),
  read_time       integer not null default 5 check (read_time between 1 and 120),
  author_id       uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blogs_published_idx on public.blogs (status, published_at desc);
-- At most one hero article at a time.
create unique index if not exists blogs_single_hero on public.blogs (display) where display = 'hero';

-- Atomically promote one article to the hero slot (runs with the caller's RLS).
create or replace function public.set_hero_blog(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  update public.blogs set display = 'grid' where display = 'hero' and id <> p_id;
  update public.blogs set display = 'hero' where id = p_id;
end;
$$;

-- =============================================================================
-- 8. COMPANY DOCUMENTS  (tax card, commercial register, VAT, importers card…)
-- =============================================================================
create table if not exists public.company_documents (
  id              uuid primary key default gen_random_uuid(),
  doc_type        text not null default 'other'
                  check (doc_type in ('tax_card', 'commercial_register', 'vat', 'importers_card', 'certificate', 'other')),
  title_ar        text not null,
  title_en        text not null,
  description_ar  text,
  description_en  text,
  image_url       text,          -- preview image (shown in the gallery)
  file_url        text,          -- optional PDF / original file
  sort_order      integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================================================
-- 9. PARTNERS & PROJECTS
-- =============================================================================
create table if not exists public.partners_and_projects (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('partner', 'project')),
  title_ar      text,
  title_en      text not null,
  location_ar   text,           -- projects
  location_en   text,
  category_ar   text,           -- projects: sector / type
  category_en   text,
  image_url     text,           -- partner logo or project photo
  website_url   text,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists partners_projects_kind_idx on public.partners_and_projects (kind, sort_order);

-- =============================================================================
-- 10. SITE SETTINGS  (singleton row, id = 1)
-- =============================================================================
create table if not exists public.site_settings (
  id                   smallint primary key default 1 check (id = 1),
  -- identity
  site_name_ar         text not null default 'توب باور',
  site_name_en         text not null default 'TOP POWER',
  logo_text            text not null default 'TOP POWER',
  tagline_ar           text,
  tagline_en           text,
  legal_name_ar        text,
  legal_name_en        text,
  -- branding assets
  logo_url             text,
  logo_full_url        text,
  favicon_url          text,
  og_image_url         text,
  -- theme (hex)
  color_primary        text not null default '#153726' check (color_primary ~ '^#[0-9A-Fa-f]{6}$'),
  color_secondary      text not null default '#215733' check (color_secondary ~ '^#[0-9A-Fa-f]{6}$'),
  color_accent         text not null default '#CDB074' check (color_accent ~ '^#[0-9A-Fa-f]{6}$'),
  -- contact & floating buttons
  phones               text[] not null default '{}',
  call_number          text,
  whatsapp_number      text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{6,15}$'),
  whatsapp_greeting_ar text,
  whatsapp_greeting_en text,
  email                text,
  address_ar           text,
  address_en           text,
  working_hours_ar     text,
  working_hours_en     text,
  map_embed_url        text check (map_embed_url is null or map_embed_url ~ '^https://'),
  -- social
  facebook_url         text,
  instagram_url        text,
  tiktok_url           text,
  -- navigation: [{label_ar, label_en, href, visible}]
  nav_links            jsonb not null default '[]'::jsonb check (jsonb_typeof(nav_links) = 'array'),
  footer_links         jsonb not null default '[]'::jsonb check (jsonb_typeof(footer_links) = 'array'),
  -- registration data shown in the footer
  importers_number     text,
  tax_card_number      text,
  vat_registered       boolean not null default true,
  certifications_strip text,
  -- SEO defaults
  site_url             text,
  meta_title_ar        text,
  meta_title_en        text,
  meta_description_ar  text,
  meta_description_en  text,
  updated_by           uuid references public.profiles (id) on delete set null,
  updated_at           timestamptz not null default now()
);

-- =============================================================================
-- 11. TRANSLATIONS  (static UI dictionary: buttons, labels, messages)
-- -----------------------------------------------------------------------------
-- Dotted keys ('cta.contact') are nested into { cta: { contact } } by the app.
-- =============================================================================
create table if not exists public.translations (
  key          text primary key check (key ~ '^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$'),
  namespace    text generated always as (split_part(key, '.', 1)) stored,
  value_ar     text not null default '',
  value_en     text not null default '',
  description  text,
  updated_at   timestamptz not null default now()
);
create index if not exists translations_namespace_idx on public.translations (namespace);

-- =============================================================================
-- 12. CONTACT SUBMISSIONS  (messages from the public contact form)
-- =============================================================================
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) <= 200 and email ~ '^\S+@\S+\.\S+$'),
  phone       text not null check (char_length(phone) between 1 and 40),
  subject     text check (subject is null or char_length(subject) <= 200),
  message     text not null check (char_length(message) between 1 and 5000),
  lang        text not null default 'ar' check (lang in ('ar', 'en')),
  status      text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists contact_submissions_status_idx on public.contact_submissions (status, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'pages', 'sections', 'section_content', 'product_categories', 'products',
    'blogs', 'company_documents', 'partners_and_projects', 'site_settings', 'translations',
    'contact_submissions'
  ] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format(
      'create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles              enable row level security;
alter table public.pages                 enable row level security;
alter table public.sections              enable row level security;
alter table public.section_content       enable row level security;
alter table public.product_categories    enable row level security;
alter table public.products              enable row level security;
alter table public.blogs                 enable row level security;
alter table public.company_documents     enable row level security;
alter table public.partners_and_projects enable row level security;
alter table public.site_settings         enable row level security;
alter table public.translations          enable row level security;
alter table public.contact_submissions   enable row level security;

-- Drop-and-create keeps this script re-runnable.
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in (
      'profiles', 'pages', 'sections', 'section_content', 'product_categories', 'products',
      'blogs', 'company_documents', 'partners_and_projects', 'site_settings', 'translations',
      'contact_submissions')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

-- ---- profiles: users see their own row; admins manage everyone -------------
create policy "profiles: read own"       on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: admin write"    on public.profiles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---- public content: published rows readable by everyone ------------------
create policy "pages: public read"       on public.pages for select to anon, authenticated
  using (is_published);
create policy "sections: public read"    on public.sections for select to anon, authenticated
  using (is_visible and exists (select 1 from public.pages p where p.id = page_id and p.is_published));
create policy "section_content: public read" on public.section_content for select to anon, authenticated
  using (exists (
    select 1 from public.sections s join public.pages p on p.id = s.page_id
    where s.id = section_id and s.is_visible and p.is_published));
create policy "categories: public read"  on public.product_categories for select to anon, authenticated
  using (is_published);
create policy "products: public read"    on public.products for select to anon, authenticated
  using (is_published and exists (
    select 1 from public.product_categories c where c.id = category_id and c.is_published));
create policy "blogs: public read"       on public.blogs for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy "documents: public read"   on public.company_documents for select to anon, authenticated
  using (is_published);
create policy "partners: public read"    on public.partners_and_projects for select to anon, authenticated
  using (is_published);
create policy "settings: public read"    on public.site_settings for select to anon, authenticated
  using (true);
create policy "translations: public read" on public.translations for select to anon, authenticated
  using (true);

-- ---- admin: full access on every CMS table --------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'pages', 'sections', 'section_content', 'product_categories', 'products', 'blogs',
    'company_documents', 'partners_and_projects', 'site_settings', 'translations',
    'contact_submissions'
  ] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t || ': admin all', t
    );
  end loop;
end;
$$;

-- ---- contact form: anyone may submit a *new* message, nobody else reads ---
create policy "contact: public insert"   on public.contact_submissions for insert to anon, authenticated
  with check (status = 'new' and notes is null);

-- -----------------------------------------------------------------------------
-- Grants (RLS still decides which rows are visible / writable)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on
  public.pages, public.sections, public.section_content, public.product_categories, public.products,
  public.blogs, public.company_documents, public.partners_and_projects, public.site_settings,
  public.translations
  to anon, authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.set_hero_blog(uuid) to authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.guard_profile_role() from anon, authenticated, public;

-- =============================================================================
-- STORAGE  — public "media" bucket; only admins can upload / replace / delete
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 20971520,  -- 20 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read"   on storage.objects;
drop policy if exists "media: admin read"    on storage.objects;
drop policy if exists "media: admin insert"  on storage.objects;
drop policy if exists "media: admin update"  on storage.objects;
drop policy if exists "media: admin delete"  on storage.objects;

-- Files are served through the bucket's public URL, so visitors need no SELECT
-- policy; only admins may list the bucket (the dashboard media picker).
create policy "media: admin read"   on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
