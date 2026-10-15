-- =============================================================================
-- MECH catalogs and check valve certificates.
--
-- · Three MECH (Jinan Meide) catalogs on /catalog, shipped in public/catalogs/
--   with a cover in public/images/catalogs/: seamless steel pipes, BS malleable
--   iron fittings and BS & DIN fire protection valves. Each belongs to its
--   product line, so the Pipes, Fittings and Valves pages list it first.
-- · The UL (EX16203) and FM (PR456599) certificates for MECH check valves,
--   shipped in public/certificates/ with a preview in public/images/docs/.
--   They join the About page's documents gallery after the other documents.
-- · The catalog page's meta description names all four product lines.
-- Safe to re-run: dashboard edits are kept.
-- =============================================================================
begin;

-- -----------------------------------------------------------------------------
-- 1. Catalogs (each only when its slug isn't used yet), after the others
-- -----------------------------------------------------------------------------
insert into public.catalogs (
  slug, title_ar, title_en, description_ar, description_en, category_ar, category_en, brand,
  category_id, file_url, cover_url, page_count, file_size, sort_order
)
select v.slug, v.title_ar, v.title_en, v.description_ar, v.description_en, v.category_ar, v.category_en, v.brand,
       (select id from public.product_categories where slug = v.line), v.file_url, v.cover_url, v.page_count, v.file_size,
       (select coalesce(max(sort_order), -1) + 1 from public.catalogs) + v.n
from (values
  (
    'mech-seamless-pipes', 'كتالوج مواسير MECH السيملس', 'MECH Seamless Steel Pipe Catalog',
    'مواسير صلب سيملس من مجموعة Meide وفق ASTM A53 / API 5L وASTM A795 وEN 10216، سوداء أو مجلفنة أو إيبوكسي أو مدهونة، معتمدة UL — جداول الأقطار والسماكات والأوزان وضغوط الاختبار.',
    'Seamless steel pipes from Meide Group to ASTM A53 / API 5L, ASTM A795 and EN 10216 — black, galvanized, epoxy or painted, UL certified — with diameters, wall thicknesses, weights and test pressures.',
    'المواسير', 'Pipes', 'MECH', 'pipes',
    '/catalogs/mech-seamless-pipes.pdf', '/images/catalogs/mech-seamless-pipes.jpg', 15, 4768705::bigint, 0
  ),
  (
    'mech-malleable-iron-fittings', 'كتالوج وصلات الحديد المطاوع MECH', 'MECH Malleable Iron Fittings Catalog',
    'وصلات قلاووظ من الحديد المطاوع بالمواصفة البريطانية BS من Jinan Meide (براند K): أكواع وتيهات وصلبان وجلب وبوش وسدادات وطبات ويونيون وفلانشات، مع جداول الأبعاد من ⅛" حتى 6".',
    'BS standard threaded malleable iron fittings by Jinan Meide (K brand): elbows, tees, crosses, sockets, bushings, plugs, caps, unions and flanges — dimension tables from ⅛" to 6".',
    'وصلات المواسير', 'Pipe Fittings', 'MECH', 'fittings',
    '/catalogs/mech-malleable-iron-fittings.pdf', '/images/catalogs/mech-malleable-iron-fittings.jpg', 18, 21114017::bigint, 1
  ),
  (
    'mech-fire-valves', 'كتالوج محابس الحريق MECH', 'MECH Fire Protection Valves Catalog',
    'محابس الحماية من الحريق بالمواصفات BS وDIN بضغط PN10/16: محابس بوابية OS&Y وNRS معتمدة UL/FM، ومحابس فراشة بصندوق إشارة، ومحابس عدم رجوع، وفلاتر Y، ومحابس ديلوج، ومبينات سريان المياه.',
    'BS & DIN standard fire protection valves, PN10/16: UL/FM resilient OS&Y and NRS gate valves, butterfly valves with signal gearbox, check valves, Y-strainers, deluge alarm valves and water flow indicators.',
    'المحابس', 'Valves', 'MECH', 'valves',
    '/catalogs/mech-fire-valves.pdf', '/images/catalogs/mech-fire-valves.jpg', 30, 36373770::bigint, 2
  )
) v (slug, title_ar, title_en, description_ar, description_en, category_ar, category_en, brand, line, file_url, cover_url, page_count, file_size, n)
where not exists (select 1 from public.catalogs c where c.slug = v.slug);

-- -----------------------------------------------------------------------------
-- 2. Certificates (each only when its PDF isn't listed yet), after the other
--    documents
-- -----------------------------------------------------------------------------
insert into public.company_documents (doc_type, title_ar, title_en, description_ar, description_en, image_url, file_url, sort_order)
select 'certificate', v.title_ar, v.title_en, v.description_ar, v.description_en, v.image_url, v.file_url,
       (select coalesce(max(sort_order), -1) + 1 from public.company_documents) + v.n
from (values
  (
    'شهادة مطابقة UL', 'UL Certificate of Compliance',
    'محابس عدم الرجوع لأنظمة الحريق (H44X2 وH84X وDH77XSR) وفق UL 312 — شهادة رقم EX16203',
    'Fire-protection check valves (H44X2, H84X, DH77XSR) to UL 312 — certificate no. EX16203',
    '/images/docs/ul-check-valves.jpg', '/certificates/ul-check-valves.pdf', 0
  ),
  (
    'شهادة اعتماد FM', 'FM Approvals Certificate of Compliance',
    'محابس عدم الرجوع المتأرجحة H44X2 وH44X2A وH84X وH84XF4 — رقم الاعتماد PR456599',
    'Swing check valves H44X2, H44X2A, H84X and H84XF4 — approval ID PR456599',
    '/images/docs/fm-swing-check-valves.jpg', '/certificates/fm-swing-check-valves.pdf', 1
  )
) v (title_ar, title_en, description_ar, description_en, image_url, file_url, n)
where not exists (select 1 from public.company_documents d where d.file_url = v.file_url);

-- -----------------------------------------------------------------------------
-- 3. Catalog page description (where it still has the original text)
-- -----------------------------------------------------------------------------
update public.pages
set meta_description_ar = 'تصفح كتالوجات المواسير والوصلات والمحابس ورشاشات الحريق من المصانع العالمية التي تمثلها توب باور، أو حمّلها بصيغة PDF.'
where slug = 'catalogs'
  and meta_description_ar = 'تصفح كتالوجات رشاشات الحريق والمواسير من المصانع العالمية التي تمثلها توب باور، أو حمّلها بصيغة PDF.';
update public.pages
set meta_description_en = 'Browse pipe, fitting, valve and fire sprinkler catalogs from the manufacturers TOP POWER represents, or download them as PDF.'
where slug = 'catalogs'
  and meta_description_en = 'Browse fire sprinkler and pipe catalogs from the manufacturers TOP POWER represents, or download them as PDF.';

commit;
