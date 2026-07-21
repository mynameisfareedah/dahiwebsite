-- 013_align_events_resources_columns.sql
-- Aligns resources/events columns used by production frontend services.

ALTER TABLE IF EXISTS public.resources
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS selar_url text,
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;

UPDATE public.resources
SET
  price = COALESCE(price, 0),
  cover_image = COALESCE(NULLIF(cover_image, ''), NULLIF(thumbnail_url, ''))
WHERE price IS NULL OR cover_image IS NULL;

CREATE INDEX IF NOT EXISTS idx_resources_selar_url ON public.resources (selar_url);
CREATE INDEX IF NOT EXISTS idx_resources_price ON public.resources (price);

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS registration_url text,
  ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
