-- =============================================================================
-- Approval certificates in the About page's documents gallery.
--
-- · The UL and FM certificates for British Standard malleable iron fittings,
--   shipped in public/certificates/ with a preview in public/images/docs/.
--   They are company_documents of type `certificate`, listed after the other
--   documents; their PDF opens in the page-turning viewer.
-- Safe to re-run: dashboard edits are kept.
-- =============================================================================
begin;

-- -----------------------------------------------------------------------------
-- 1. The certificates (each only when its PDF isn't listed yet), after the
--    other documents
-- -----------------------------------------------------------------------------
insert into public.company_documents (doc_type, title_ar, title_en, description_ar, description_en, image_url, file_url, sort_order)
select 'certificate', v.title_ar, v.title_en, v.description_ar, v.description_en, v.image_url, v.file_url,
       (select coalesce(max(sort_order), -1) + 1 from public.company_documents) + v.n
from (values
  (
    'شهادة مطابقة UL', 'UL Certificate of Compliance',
    'وصلات الحديد المطاوع بالمواصفة البريطانية ISO 49 / EN 10242 — شهادة رقم EX6624',
    'British Standard malleable iron fittings (ISO 49 / EN 10242) — certificate no. EX6624',
    '/images/docs/ul-certificate.jpg', '/certificates/ul-malleable-iron-fittings.pdf', 0
  ),
  (
    'شهادة اعتماد FM', 'FM Approvals Certificate of Compliance',
    'وصلات الحديد المطاوع بالمواصفة البريطانية — رقم الاعتماد 3038663',
    'British Standard malleable iron fittings — approval ID 3038663',
    '/images/docs/fm-certificate.jpg', '/certificates/fm-malleable-iron-fittings.pdf', 1
  )
) v (title_ar, title_en, description_ar, description_en, image_url, file_url, n)
where not exists (select 1 from public.company_documents d where d.file_url = v.file_url);

-- -----------------------------------------------------------------------------
-- 2. A certificate sharing its position with another document (the first
--    version of this migration put them at 0 and 1) moves after the others.
-- -----------------------------------------------------------------------------
with clash as (
  select d.id, row_number() over (order by d.sort_order, d.created_at) as n
  from public.company_documents d
  where d.doc_type = 'certificate'
    and exists (select 1 from public.company_documents o where o.id <> d.id and o.sort_order = d.sort_order)
)
update public.company_documents d
set sort_order = (select max(sort_order) from public.company_documents) + clash.n
from clash
where d.id = clash.id;

commit;
