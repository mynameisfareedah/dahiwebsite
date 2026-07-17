-- 003_create_team_members.sql
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  department text,
  bio text,
  photo_url text,
  email text,
  linkedin_url text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique email when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'team_members' AND c.conname = 'team_members_email_key'
  ) THEN
    ALTER TABLE public.team_members ADD CONSTRAINT team_members_email_key UNIQUE (email);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_team_display_order ON public.team_members (display_order);
CREATE INDEX IF NOT EXISTS idx_team_active ON public.team_members (active);
CREATE INDEX IF NOT EXISTS idx_team_status ON public.team_members (status);

DROP TRIGGER IF EXISTS trg_team_set_updated_at ON public.team_members;
CREATE TRIGGER trg_team_set_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.team_members;
CREATE POLICY "public_read_active" ON public.team_members
  FOR SELECT
  USING (active = true AND status = 'active');

DROP POLICY IF EXISTS "authenticated_select_owner_or_all" ON public.team_members;
CREATE POLICY "authenticated_select_owner_or_all" ON public.team_members
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert" ON public.team_members;
CREATE POLICY "authenticated_insert" ON public.team_members
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.team_members;
CREATE POLICY "owner_update" ON public.team_members
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.team_members;
CREATE POLICY "owner_delete" ON public.team_members
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.team_members IS 'Staff and team member profiles';
