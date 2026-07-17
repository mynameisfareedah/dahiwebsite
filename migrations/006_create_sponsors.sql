-- 006_create_sponsors.sql
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  description text,
  sponsorship_level text,
  amount numeric DEFAULT 0 CHECK (amount >= 0),
  active boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_status ON public.sponsors (status);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors (active);

DROP TRIGGER IF EXISTS trg_sponsors_set_updated_at ON public.sponsors;
CREATE TRIGGER trg_sponsors_set_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_sponsors" ON public.sponsors;
CREATE POLICY "public_read_active_sponsors" ON public.sponsors
  FOR SELECT
  USING (active = true AND status = 'active');

DROP POLICY IF EXISTS "authenticated_insert" ON public.sponsors;
CREATE POLICY "authenticated_insert" ON public.sponsors
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.sponsors;
CREATE POLICY "owner_update" ON public.sponsors
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.sponsors;
CREATE POLICY "owner_delete" ON public.sponsors
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.sponsors IS 'Sponsor organizations and details';
