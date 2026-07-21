-- 012_enhance_resources_metadata.sql
-- Adds production metadata fields required by admin resource uploads.

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS storage_path text;

UPDATE public.resources
SET
  category = COALESCE(NULLIF(category, ''), resource_type, 'general'),
  file_name = COALESCE(NULLIF(file_name, ''), NULLIF(regexp_replace(COALESCE(file_url, ''), '^.*/', ''), ''), 'resource-file'),
  file_type = COALESCE(NULLIF(file_type, ''), 'application/octet-stream'),
  file_size = COALESCE(file_size, 0)
WHERE
  category IS NULL
  OR file_name IS NULL
  OR file_type IS NULL
  OR file_size IS NULL;

ALTER TABLE public.resources
  ALTER COLUMN category SET DEFAULT 'general',
  ALTER COLUMN file_name SET DEFAULT 'resource-file',
  ALTER COLUMN file_type SET DEFAULT 'application/octet-stream',
  ALTER COLUMN file_size SET DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resources' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.resources ALTER COLUMN category SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resources' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE public.resources ALTER COLUMN file_name SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resources' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE public.resources ALTER COLUMN file_type SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'resources' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE public.resources ALTER COLUMN file_size SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources (category);
CREATE INDEX IF NOT EXISTS idx_resources_file_name ON public.resources (file_name);
