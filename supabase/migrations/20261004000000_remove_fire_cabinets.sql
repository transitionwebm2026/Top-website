-- =============================================================================
-- Remove the Fire Cabinets product line: the `cabinets` category, its products
-- (hose reel / hose reel & extinguisher / landing valve cabinets) and the text
-- that mentions fire cabinets on the products and about pages.
-- Safe to re-run: every statement is a no-op once the content is gone.
-- =============================================================================
begin;

-- products.category_id is ON DELETE RESTRICT, so the products go first.
delete from public.products
where category_id in (select id from public.product_categories where slug = 'cabinets');

delete from public.product_categories where slug = 'cabinets';

-- /products meta description
update public.pages set
  meta_description_ar = replace(meta_description_ar, 'محابس، رشاشات وصناديق حريق', 'محابس ورشاشات حريق'),
  meta_description_en = replace(meta_description_en, 'valves, sprinklers and fire cabinets', 'valves and sprinklers')
where slug = 'market';

-- Products hero description + about-us history timeline
update public.section_content set
  content_ar = replace(
    replace(content_ar::text, '، الرشاشات وصناديق الحريق،', ' والرشاشات،'),
    ' الرشاشات وصناديق الحريق', ' الرشاشات'
  )::jsonb,
  content_en = replace(content_en::text, ', Sprinklers, and Fire Hose Cabinets', ', and Sprinklers')::jsonb
where content_ar::text like '%صناديق الحريق%' or content_en::text like '%Fire Hose Cabinets%';

commit;
