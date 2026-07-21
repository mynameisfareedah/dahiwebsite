-- 014_resources_external_link_architecture.sql
-- Refactors resources to external-link architecture (no downloadable file dependency).

ALTER TABLE IF EXISTS public.resources
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS button_text text,
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS featured boolean,
  ADD COLUMN IF NOT EXISTS price numeric(10,2),
  ADD COLUMN IF NOT EXISTS resource_type text;

UPDATE public.resources
SET
  external_url = COALESCE(
    NULLIF(external_url, ''),
    NULLIF(selar_url, ''),
    NULLIF(file_url, '')
  ),
  platform = COALESCE(NULLIF(platform, ''), 'External'),
  button_text = NULLIF(button_text, ''),
  currency = COALESCE(NULLIF(currency, ''), 'NGN'),
  price = COALESCE(price, 0),
  category = COALESCE(NULLIF(category, ''), NULLIF(resource_type, ''), 'general'),
  resource_type = COALESCE(NULLIF(resource_type, ''), NULLIF(category, ''), 'general'),
  featured = COALESCE(featured, false),
  cover_image = COALESCE(NULLIF(cover_image, ''), NULLIF(thumbnail_url, ''));

ALTER TABLE IF EXISTS public.resources
  ALTER COLUMN external_url SET NOT NULL,
  ALTER COLUMN platform SET DEFAULT 'External',
  ALTER COLUMN currency SET DEFAULT 'NGN',
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN price SET DEFAULT 0,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN category SET DEFAULT 'general',
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN resource_type SET DEFAULT 'general',
  ALTER COLUMN resource_type SET NOT NULL,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN featured SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resources_external_url ON public.resources (external_url);
CREATE INDEX IF NOT EXISTS idx_resources_platform ON public.resources (platform);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON public.resources (resource_type);