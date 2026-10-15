-- =============================================================================
-- Sprinkler ratings, as the client gave them: K-factors K5.6, K8.0 and K12.0
-- and temperature ratings 68°C, 79°C and 93°C, the same for all four types
-- (were K5.6 / K8.0 / K11.2 and 57–182°C; sidewall and concealed K5.6 / K8.0,
-- concealed 57–93°C).
-- Only the old wording is replaced, so text edited in the dashboard since is
-- kept. Safe to re-run.
-- =============================================================================
begin;

-- Replaces a piece of text inside a jsonb document (the pieces here hold no
-- quotes or backslashes, so they read the same in the document's JSON text).
create or replace function pg_temp.sub(doc jsonb, old text, new text)
returns jsonb
language sql
immutable
as $$ select replace(doc::text, old, new)::jsonb $$;

-- -----------------------------------------------------------------------------
-- 1. Category
-- -----------------------------------------------------------------------------
update public.product_categories
set description_ar = replace(description_ar,
      'متوفرة بدرجات حرارة تشغيل من 57° حتى 182° مئوية ومعاملات تدفق K5.6 وK8.0 وK11.2.',
      'متوفرة بدرجات حرارة تشغيل 68° و79° و93° مئوية ومعاملات تدفق K5.6 وK8.0 وK12.0.'),
    description_en = replace(description_en,
      'Available with temperature ratings from 57°C to 182°C and K-factors of K5.6, K8.0 and K11.2.',
      'Available in temperature ratings of 68°C, 79°C and 93°C and K-factors of K5.6, K8.0 and K12.0.'),
    sizes_label_ar = replace(sizes_label_ar, '¾" NPT K11.2', '¾" NPT K12.0'),
    sizes_label_en = replace(sizes_label_en, '¾" NPT K11.2', '¾" NPT K12.0'),
    specs = pg_temp.sub(pg_temp.sub(specs,
      '57°C – 182°C', '68°C · 79°C · 93°C'),
      'K5.6 · K8.0 · K11.2', 'K5.6 · K8.0 · K12.0')
where slug = 'sprinklers';

-- -----------------------------------------------------------------------------
-- 2. The four types
-- -----------------------------------------------------------------------------
update public.products p
set sizes = case
      when p.sizes = array['½" NPT · K5.6', '¾" NPT · K8.0', '¾" NPT · K11.2']
        or p.sizes = array['½" NPT · K5.6', '¾" NPT · K8.0']
      then array['½" NPT · K5.6', '¾" NPT · K8.0', '¾" NPT · K12.0']
      else p.sizes
    end,
    specs = pg_temp.sub(pg_temp.sub(p.specs,
      '57°C – 182°C', '68°C · 79°C · 93°C'),
      '57°C – 93°C', '68°C · 79°C · 93°C'),
    -- MECH notes: pendant and upright (K11.2), sidewall (K5.6 and K8.0 only).
    brands = pg_temp.sub(pg_temp.sub(pg_temp.sub(pg_temp.sub(p.brands,
      'بمعاملات K5.6 وK8.0 وK11.2.', 'بمعاملات K5.6 وK8.0 وK12.0.'),
      'in K5.6, K8.0 and K11.2.', 'in K5.6, K8.0 and K12.0.'),
      'بمعاملات K5.6 وK8.0.', 'بمعاملات K5.6 وK8.0 وK12.0.'),
      'in K5.6 and K8.0.', 'in K5.6, K8.0 and K12.0.')
from public.product_categories c
where c.id = p.category_id
  and c.slug = 'sprinklers'
  and p.slug in ('pendent', 'upright', 'sidewall', 'concealed');

commit;
