-- 005_create_volunteers.sql
CREATE TABLE IF NOT EXISTS public.volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  skills text,
  availability text,
  hours_logged numeric DEFAULT 0 CHECK (hours_logged >= 0),
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers (email);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers (status);
CREATE INDEX IF NOT EXISTS idx_volunteers_approval_status ON public.volunteers (approval_status);

DROP TRIGGER IF EXISTS trg_volunteers_set_updated_at ON public.volunteers;
CREATE TRIGGER trg_volunteers_set_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can insert (self), admins manage
DROP POLICY IF EXISTS "authenticated_insert" ON public.volunteers;
CREATE POLICY "authenticated_insert" ON public.volunteers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "authenticated_select_public" ON public.volunteers;
CREATE POLICY "authenticated_select_public" ON public.volunteers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "owner_update" ON public.volunteers;
CREATE POLICY "owner_update" ON public.volunteers
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.volunteers;
CREATE POLICY "owner_delete" ON public.volunteers
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.volunteers IS 'Volunteer signups and records';
