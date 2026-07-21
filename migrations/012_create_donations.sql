-- 012_create_donations.sql
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  goal_amount numeric DEFAULT 0 CHECK (goal_amount >= 0),
  amount_raised numeric DEFAULT 0 CHECK (amount_raised >= 0),
  currency text DEFAULT 'NGN',
  start_date date,
  end_date date,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'donations' AND c.conname = 'donations_slug_key'
  ) THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_donations_active ON public.donations (active);
CREATE INDEX IF NOT EXISTS idx_donations_featured ON public.donations (featured);

DROP TRIGGER IF EXISTS trg_donations_set_updated_at ON public.donations;
CREATE TRIGGER trg_donations_set_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_donations" ON public.donations;
CREATE POLICY "public_read_active_donations" ON public.donations
  FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.donations;
CREATE POLICY "authenticated_insert" ON public.donations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.donations;
CREATE POLICY "owner_update" ON public.donations
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.donations;
CREATE POLICY "owner_delete" ON public.donations
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.donations IS 'Donation campaigns and fundraising drives';
