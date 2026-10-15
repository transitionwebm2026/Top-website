-- =============================================================================
-- Home page: the rotating text ring around the "15+" badge.
--
-- · Arabic text for the Arabic page (it had the English text in both
--   languages) and "15 years of expertise" instead of "since 20 years".
--   In the Arabic text every Latin part (UL · FM · NFPA, MEP) sits between
--   Arabic words, so "15" stays with "سنة خبرة" on the ring.
-- · Only where the ring still has the original text (or none): a text edited
--   in the dashboard is kept. Safe to re-run.
-- =============================================================================
begin;

update public.section_content sc
set content_ar = case
      when sc.content_ar ->> 'ring_text' is null
        or sc.content_ar ->> 'ring_text' = 'FIRE SAFETY · MEP SOLUTIONS · UL · FM · NFPA · SINCE 20 YEARS ·'
      then jsonb_set(coalesce(sc.content_ar, '{}'::jsonb), '{ring_text}',
                     to_jsonb('السلامة من الحريق · 15 سنة خبرة · UL · FM · NFPA · حلول MEP متكاملة ·'::text))
      else sc.content_ar
    end,
    content_en = case
      when sc.content_en ->> 'ring_text' is null
        or sc.content_en ->> 'ring_text' = 'FIRE SAFETY · MEP SOLUTIONS · UL · FM · NFPA · SINCE 20 YEARS ·'
      then jsonb_set(coalesce(sc.content_en, '{}'::jsonb), '{ring_text}',
                     to_jsonb('FIRE SAFETY · MEP SOLUTIONS · UL · FM · NFPA · 15 YEARS OF EXPERTISE ·'::text))
      else sc.content_en
    end
from public.sections s
join public.pages p on p.id = s.page_id
where sc.section_id = s.id
  and p.slug = 'home'
  and s.key = 'about_summary';

commit;
