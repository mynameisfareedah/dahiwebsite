-- 002_create_resources.sql
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  resource_type text NOT NULL,
  author text,
  file_url text,
  thumbnail_url text,
  downloads integer DEFAULT 0 CHECK (downloads >= 0),
  featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','deleted')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'resources' AND c.conname = 'resources_slug_key'
  ) THEN
    ALTER TABLE public.resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources (slug);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources (status);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON public.resources (resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON public.resources (featured);

DROP TRIGGER IF EXISTS trg_resources_set_updated_at ON public.resources;
CREATE TRIGGER trg_resources_set_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published" ON public.resources;
CREATE POLICY "public_read_published" ON public.resources
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "authenticated_select_owner_or_published" ON public.resources;
CREATE POLICY "authenticated_select_owner_or_published" ON public.resources
  FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

DROP POLICY IF EXISTS "authenticated_insert" ON public.resources;
CREATE POLICY "authenticated_insert" ON public.resources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.resources;
CREATE POLICY "owner_update" ON public.resources
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.resources;
CREATE POLICY "owner_delete" ON public.resources
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.resources IS 'Downloadable resources and documents';
