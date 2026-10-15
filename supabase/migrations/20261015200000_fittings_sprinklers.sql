-- =============================================================================
-- Fittings and sprinklers, as the client asked.
--
-- · Fittings: the Arabic trade names — وصلات لحام / قلاووظ / جروف (were
--   لحام تناكبي / مسننة / مجرّاة) in the type names, descriptions, lists and
--   brand notes, and in the MECH malleable fittings catalog description.
--   English is unchanged.
-- · Sprinklers: four types — pendant, upright, sidewall, concealed — replace
--   standard response / quick response / extended coverage. Each type comes
--   in several temperature ratings and K-factors (MECH catalog: K5.6 and K8.0
--   in all three MECH types, K11.2 in pendant and upright; 57–182°C). MECH
--   has no concealed model, so concealed is Reliable. The upright type takes
--   the photo uploaded for extended coverage (a Reliable/RASCO upright).
-- Safe to re-run: text edited in the dashboard since is kept, and the
-- sprinkler block runs only while the old types still exist.
-- =============================================================================
begin;

-- -----------------------------------------------------------------------------
-- 1. Fittings (Arabic)
-- -----------------------------------------------------------------------------
-- Replaces one JSON string value inside a jsonb document.
create or replace function pg_temp.swap(doc jsonb, old text, new text)
returns jsonb
language sql
immutable
as $$ select replace(doc::text, to_jsonb(old)::text, to_jsonb(new)::text)::jsonb $$;

update public.products p
set name_ar = case when p.name_ar = v.old_name then v.new_name else p.name_ar end,
    description_ar = case when p.description_ar = v.old_desc then v.new_desc else p.description_ar end,
    brands = pg_temp.swap(p.brands, v.old_brand, v.new_brand)
from public.product_categories c,
(values
  (
    'butt-weld', 'وصلات لحام تناكبي', 'وصلات لحام',
    'وصلات صلب كربوني سيملس للّحام التناكبي، لتغيير الاتجاه وتفريع الخطوط تحت الضغط العالي.',
    'وصلات لحام من الصلب الكربوني السيملس، لتغيير الاتجاه وتفريع الخطوط تحت الضغط العالي.',
    'وصلات TTU التايلاندية السيملس للّحام التناكبي.',
    'وصلات لحام TTU التايلاندية السيملس.'
  ),
  (
    'threaded', 'وصلات مسننة', 'وصلات قلاووظ',
    'وصلات حديد مطاوع معالج حرارياً، متينة ومقاومة للتشقق، سوداء أو مجلفنة.',
    'وصلات قلاووظ من الحديد المطاوع المعالج حرارياً، متينة ومقاومة للتشقق، سوداء أو مجلفنة.',
    'وصلات MECH المسننة المعتمدة UL وFM.',
    'وصلات MECH القلاووظ المعتمدة UL وFM.'
  ),
  (
    'grooved', 'وصلات مجرّاة', 'وصلات جروف',
    'حديد دكتايل مدهون إيبوكسي أحمر، تركيب أسرع 3 إلى 4 مرات من اللحام بدون لهب.',
    'وصلات جروف من حديد الدكتايل المدهون إيبوكسي أحمر، تركيب أسرع 3 إلى 4 مرات من اللحام بدون لهب.',
    'نحن الوكيل الحصري لوصلات MECH المجرّاة المعتمدة UL/FM.',
    'نحن الوكيل الحصري لوصلات الجروف MECH المعتمدة UL/FM.'
  )
) v (slug, old_name, new_name, old_desc, new_desc, old_brand, new_brand)
where c.id = p.category_id
  and c.slug = 'fittings'
  and p.slug = v.slug;

-- Category texts: the live wording and the original seed wording.
update public.product_categories
set short_ar = replace(replace(short_ar,
      'وصلات اللحام التناكبي، المسننة، المجرّاة،', 'وصلات اللحام، والقلاووظ، والجروف،'),
      'لحام تناكبي، مسننة، مجرّاة،', 'لحام، قلاووظ، جروف،'),
    description_ar = replace(replace(replace(replace(replace(description_ar,
      'اللحام التناكبي من', 'اللحام من'),
      'والوصلات المسننة من', 'ووصلات القلاووظ من'),
      'والوصلات المجرّاة من', 'ووصلات الجروف من'),
      'والمسننة من', 'والقلاووظ من'),
      'والمجرّاة من', 'والجروف من'),
    specs = pg_temp.swap(specs, 'لحام / مسنن / مجرّى / مطروق', 'لحام / قلاووظ / جروف / مطروق'),
    items_ar = array_replace(array_replace(array_replace(items_ar,
      'وصلات لحام تناكبي', 'وصلات لحام'),
      'وصلات مسننة', 'وصلات قلاووظ'),
      'وصلات مجرّاة', 'وصلات جروف')
where slug = 'fittings';

update public.catalogs
set description_ar = replace(description_ar, 'وصلات حديد مطاوع مسننة بالمواصفة', 'وصلات قلاووظ من الحديد المطاوع بالمواصفة')
where slug = 'mech-malleable-iron-fittings';

-- -----------------------------------------------------------------------------
-- 2. Sprinklers: category (while the old types exist)
-- -----------------------------------------------------------------------------
update public.product_categories c
set short_ar = 'نوفر رشاشات حريق من علامتي MECH وReliable بأربعة أنواع: متدلي، وقائم، وجانبي، ومخفي، وكلها متوفرة بدرجات حرارة تشغيل ومعاملات تدفق K مختلفة لتناسب مختلف تطبيقات أنظمة الحماية من الحريق.',
    short_en = 'We supply fire sprinklers from MECH and Reliable in four types: pendant, upright, sidewall and concealed, all available in different temperature ratings and K-factors to suit every fire protection application.',
    description_ar = 'رشاشات حريق معتمدة UL/FM بتقنية استجابة حرارية دقيقة وسريعة للمساعدة في الحد من انتشار الحريق، مع مقاومة عالية للتآكل لضمان أداء موثوق. متوفرة بدرجات حرارة تشغيل من 57° حتى 182° مئوية ومعاملات تدفق K5.6 وK8.0 وK11.2.',
    description_en = 'UL/FM approved fire sprinklers featuring precise thermal sensitivity and fast response to help control fire spread, with high corrosion resistance for reliable performance. Available with temperature ratings from 57°C to 182°C and K-factors of K5.6, K8.0 and K11.2.',
    sizes_label_ar = '½" NPT K5.6 · ¾" NPT K8.0 · ¾" NPT K11.2',
    sizes_label_en = '½" NPT K5.6 · ¾" NPT K8.0 · ¾" NPT K11.2',
    specs = '[
      {"label_ar":"الأنواع","label_en":"Types","value_ar":"متدلي / قائم / جانبي / مخفي","value_en":"Pendant / Upright / Sidewall / Concealed"},
      {"label_ar":"درجات التشغيل","label_en":"Temperatures","value_ar":"57°C – 182°C","value_en":"57°C – 182°C"},
      {"label_ar":"معامل التدفق K","label_en":"K-factor","value_ar":"K5.6 · K8.0 · K11.2","value_en":"K5.6 · K8.0 · K11.2"},
      {"label_ar":"التشطيب","label_en":"Finish","value_ar":"نحاسي / كروم / أبيض","value_en":"Brass / chrome / white"}
    ]'::jsonb,
    items_ar = array['رشاشات متدلية', 'رشاشات قائمة', 'رشاشات جانبية', 'رشاشات مخفية'],
    items_en = array['Pendant sprinklers', 'Upright sprinklers', 'Sidewall sprinklers', 'Concealed sprinklers']
where c.slug = 'sprinklers'
  and exists (select 1 from public.products p where p.category_id = c.id and p.slug in ('standard', 'quick', 'extended'));

-- -----------------------------------------------------------------------------
-- 3. Sprinklers: the four types (while the old types exist)
-- -----------------------------------------------------------------------------
insert into public.products (
  category_id, slug, icon, name_ar, name_en, description_ar, description_en, cover_image, gallery, sizes,
  pressure_ar, pressure_en, standard, specs, shapes, brands, sort_order
)
select c.id, v.slug, v.slug, v.name_ar, v.name_en, v.description_ar, v.description_en, v.cover_image, v.gallery, v.sizes,
       '175 PSI', '175 PSI', 'UL 199 · FM', v.specs, '[]'::jsonb, v.brands, v.sort_order
from public.product_categories c
cross join (values
  (
    'pendent', 'رشاشات متدلية Pendant', 'Pendant Sprinklers',
    'تُركب متدلية من الماسورة أسفل السقف، وهي الأكثر استخداماً في المكاتب والفنادق والمستشفيات والمباني ذات الأسقف المعلقة.',
    'Installed hanging down from the pipe below the ceiling — the most common type in offices, hotels, hospitals and buildings with suspended ceilings.',
    '/images/items/sprinkler-pendent.jpg', array['/images/items/sprinkler-brass.jpg'],
    array['½" NPT · K5.6', '¾" NPT · K8.0', '¾" NPT · K11.2'],
    '[
      {"label_ar":"درجات التشغيل","label_en":"Temperatures","value_ar":"57°C – 182°C","value_en":"57°C – 182°C"},
      {"label_ar":"الاستجابة","label_en":"Response","value_ar":"سريعة (أمبول 3 مم) / قياسية (5 مم)","value_en":"Quick (3 mm bulb) / standard (5 mm)"}
    ]'::jsonb,
    '[
      {"name_ar":"MECH","name_en":"MECH","logo":"/images/brands/mech.png","image":"/images/items/sprinkler-pendent.jpg","desc_ar":"رشاشات MECH المتدلية المعتمدة UL/FM بمعاملات K5.6 وK8.0 وK11.2.","desc_en":"MECH UL/FM pendant sprinklers in K5.6, K8.0 and K11.2.","datasheet":null,"is_primary":true},
      {"name_ar":"Reliable","name_en":"Reliable","logo":"/images/brands/reliable.png","image":null,"desc_ar":"رشاشات Reliable المتدلية المعتمدة UL/FM.","desc_en":"Reliable UL/FM pendant sprinklers.","datasheet":null,"is_primary":false}
    ]'::jsonb,
    0
  ),
  (
    'upright', 'رشاشات قائمة Upright', 'Upright Sprinklers',
    'تُركب قائمة فوق الماسورة وترش المياه لأعلى ثم لأسفل، مثالية للمخازن والمصانع وغرف الماكينات والأماكن بدون أسقف معلقة.',
    'Installed standing up on top of the pipe, spraying water up and then down — ideal for warehouses, factories, plant rooms and areas without suspended ceilings.',
    null, '{}'::text[],
    array['½" NPT · K5.6', '¾" NPT · K8.0', '¾" NPT · K11.2'],
    '[
      {"label_ar":"درجات التشغيل","label_en":"Temperatures","value_ar":"57°C – 182°C","value_en":"57°C – 182°C"},
      {"label_ar":"الاستجابة","label_en":"Response","value_ar":"سريعة (أمبول 3 مم) / قياسية (5 مم)","value_en":"Quick (3 mm bulb) / standard (5 mm)"}
    ]'::jsonb,
    '[
      {"name_ar":"MECH","name_en":"MECH","logo":"/images/brands/mech.png","image":null,"desc_ar":"رشاشات MECH القائمة المعتمدة UL/FM بمعاملات K5.6 وK8.0 وK11.2.","desc_en":"MECH UL/FM upright sprinklers in K5.6, K8.0 and K11.2.","datasheet":null,"is_primary":true},
      {"name_ar":"Reliable","name_en":"Reliable","logo":"/images/brands/reliable.png","image":null,"desc_ar":"رشاشات Reliable القائمة المعتمدة UL/FM.","desc_en":"Reliable UL/FM upright sprinklers.","datasheet":null,"is_primary":false}
    ]'::jsonb,
    1
  ),
  (
    'sidewall', 'رشاشات جانبية Sidewall', 'Sidewall Sprinklers',
    'تُركب على الحائط قرب السقف وترش المياه أفقياً، مناسبة للممرات وغرف الفنادق والأماكن التي يصعب فيها مد المواسير في السقف.',
    'Mounted on the wall near the ceiling, throwing water horizontally — suited to corridors, hotel rooms and spaces where ceiling piping is impractical.',
    null, '{}'::text[],
    array['½" NPT · K5.6', '¾" NPT · K8.0'],
    '[
      {"label_ar":"درجات التشغيل","label_en":"Temperatures","value_ar":"57°C – 182°C","value_en":"57°C – 182°C"},
      {"label_ar":"الاستجابة","label_en":"Response","value_ar":"سريعة (أمبول 3 مم) / قياسية (5 مم)","value_en":"Quick (3 mm bulb) / standard (5 mm)"}
    ]'::jsonb,
    '[
      {"name_ar":"MECH","name_en":"MECH","logo":"/images/brands/mech.png","image":null,"desc_ar":"رشاشات MECH الجانبية المعتمدة UL/FM بمعاملات K5.6 وK8.0.","desc_en":"MECH UL/FM sidewall sprinklers in K5.6 and K8.0.","datasheet":null,"is_primary":true},
      {"name_ar":"Reliable","name_en":"Reliable","logo":"/images/brands/reliable.png","image":null,"desc_ar":"رشاشات Reliable الجانبية المعتمدة UL/FM.","desc_en":"Reliable UL/FM sidewall sprinklers.","datasheet":null,"is_primary":false}
    ]'::jsonb,
    2
  ),
  (
    'concealed', 'رشاشات مخفية Concealed', 'Concealed Sprinklers',
    'مخفية خلف غطاء مسطح بمستوى السقف يسقط عند الحريق، لمظهر نظيف في الفنادق والمكاتب والمباني الفاخرة.',
    'Hidden behind a flat cover plate flush with the ceiling that drops away in a fire — a clean look for hotels, offices and premium interiors.',
    null, '{}'::text[],
    array['½" NPT · K5.6', '¾" NPT · K8.0'],
    '[
      {"label_ar":"درجات التشغيل","label_en":"Temperatures","value_ar":"57°C – 93°C","value_en":"57°C – 93°C"}
    ]'::jsonb,
    '[
      {"name_ar":"Reliable","name_en":"Reliable","logo":"/images/brands/reliable.png","image":null,"desc_ar":"رشاشات Reliable المخفية المعتمدة UL/FM بغطاء مسطح.","desc_en":"Reliable UL/FM concealed sprinklers with a flat cover plate.","datasheet":null,"is_primary":true}
    ]'::jsonb,
    3
  )
) v (slug, name_ar, name_en, description_ar, description_en, cover_image, gallery, sizes, specs, brands, sort_order)
where c.slug = 'sprinklers'
  and exists (select 1 from public.products p where p.category_id = c.id and p.slug in ('standard', 'quick', 'extended'))
on conflict (category_id, slug) do nothing;

-- The photo uploaded for extended coverage shows a Reliable (RASCO) upright:
-- it becomes the upright type's photo and Reliable's photo there.
update public.products u
set cover_image = e.cover_image,
    brands = (
      select jsonb_agg(case when b ->> 'name_en' = 'Reliable' then b || jsonb_build_object('image', e.cover_image) else b end order by i)
      from jsonb_array_elements(u.brands) with ordinality x (b, i)
    )
from public.products e
where e.category_id = u.category_id
  and e.slug = 'extended'
  and e.cover_image like 'http%'
  and u.slug = 'upright'
  and u.cover_image is null;

-- -----------------------------------------------------------------------------
-- 4. Sprinklers: remove the old types
-- -----------------------------------------------------------------------------
delete from public.products p
using public.product_categories c
where c.id = p.category_id
  and c.slug = 'sprinklers'
  and p.slug in ('standard', 'quick', 'extended');

commit;
