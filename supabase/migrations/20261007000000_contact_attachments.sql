-- =============================================================================
-- Contact form attachments: a visitor may attach up to 3 files (images, PDF,
-- Excel/CSV — 10 MB each) to a message.
--
-- Files go to the private `contact-attachments` bucket. Visitors can only
-- upload — never list, open, replace or delete — and only admins can open them
-- (signed links in Dashboard → Contact & Enquiries). lib/attachments.js checks
-- the same limits in the browser before uploading.
-- Safe to re-run.
-- =============================================================================
begin;

-- -----------------------------------------------------------------------------
-- 1. Private bucket: the size and type limits are enforced by Storage itself
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contact-attachments', 'contact-attachments', false, 10485760,  -- 10 MB
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  -- .xlsx
    'application/vnd.ms-excel',                                           -- .xls
    'text/csv'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "contact files: public upload" on storage.objects;
drop policy if exists "contact files: admin read"    on storage.objects;
drop policy if exists "contact files: admin delete"  on storage.objects;

-- Each message uploads into its own inbox/<random uuid>/ folder. There is no
-- SELECT or UPDATE policy for visitors, so an upload can't read, list or
-- overwrite anything (upsert is refused).
create policy "contact files: public upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'contact-attachments' and name ~ '^inbox/[0-9a-f-]{36}/[^/]{1,160}$');
create policy "contact files: admin read"   on storage.objects for select to authenticated
  using (bucket_id = 'contact-attachments' and (select public.is_admin()));
create policy "contact files: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'contact-attachments' and (select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 2. contact_submissions.attachments: [{ path, name, type, size }, …]
-- -----------------------------------------------------------------------------
create or replace function public.valid_contact_attachments(files jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when files is null or jsonb_typeof(files) <> 'array' then false
    when jsonb_array_length(files) > 3 then false
    else not exists (
      select 1 from jsonb_array_elements(files) f
      where case
        when jsonb_typeof(f) <> 'object' or coalesce(jsonb_typeof(f -> 'size'), '') <> 'number' then true
        else coalesce(f ->> 'path', '') !~ '^inbox/[0-9a-f-]{36}/[^/]{1,160}$'
          or char_length(coalesce(f ->> 'name', '')) not between 1 and 200
          or coalesce(f ->> 'type', '') not in (
            'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel', 'text/csv')
          or (f ->> 'size')::numeric not between 1 and 10485760
      end
    )
  end
$$;
grant execute on function public.valid_contact_attachments(jsonb) to anon, authenticated;

alter table public.contact_submissions
  add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.contact_submissions drop constraint if exists contact_submissions_attachments_valid;
alter table public.contact_submissions
  add constraint contact_submissions_attachments_valid check (public.valid_contact_attachments(attachments));

-- -----------------------------------------------------------------------------
-- 3. Form texts (also in supabase/seed.sql; dashboard edits are kept)
-- -----------------------------------------------------------------------------
insert into public.translations (key, value_ar, value_en) values
  ('contact.attachTitle', 'إرفاق ملفات', 'Attach files'),
  ('contact.optional', 'اختياري', 'optional'),
  ('contact.attachDrop', 'اسحب الملفات وأفلتها هنا، أو', 'Drag & drop files here, or'),
  ('contact.attachBrowse', 'اختر من جهازك', 'browse your device'),
  ('contact.attachLimits', 'حتى {count} ملفات · {size} ميجابايت للملف', 'Up to {count} files · {size} MB each'),
  ('contact.attachFull', 'وصلت للحد الأقصى من الملفات', 'Maximum number of files reached'),
  ('contact.attachTooMany', 'يمكنك إرفاق {count} ملفات كحد أقصى', 'You can attach up to {count} files'),
  ('contact.attachTooBig', '«{name}» أكبر من {size} ميجابايت', '“{name}” is larger than {size} MB'),
  ('contact.attachBadType', '«{name}»: نوع غير مدعوم — صور أو PDF أو Excel فقط', '“{name}”: unsupported type — images, PDF or Excel only'),
  ('contact.attachRemove', 'إزالة الملف', 'Remove file')
on conflict (key) do nothing;

commit;
