-- 008_create_settings.sql
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text,
  description text,
  category text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'settings' AND c.conname = 'settings_key_key'
  ) THEN
    ALTER TABLE public.settings ADD CONSTRAINT settings_key_key UNIQUE (key);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings (key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings (category);

DROP TRIGGER IF EXISTS trg_settings_set_updated_at ON public.settings;
CREATE TRIGGER trg_settings_set_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON public.settings;
CREATE POLICY "authenticated_select" ON public.settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert" ON public.settings;
CREATE POLICY "authenticated_insert" ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.settings;
CREATE POLICY "owner_update" ON public.settings
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

COMMENT ON TABLE public.settings IS 'Key/value configuration settings';
