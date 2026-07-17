-- 007_create_community_members.sql
CREATE TABLE IF NOT EXISTS public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  city text,
  country text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  engagement_score numeric DEFAULT 0 CHECK (engagement_score >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_email ON public.community_members (email);
CREATE INDEX IF NOT EXISTS idx_community_status ON public.community_members (status);

DROP TRIGGER IF EXISTS trg_community_set_updated_at ON public.community_members;
CREATE TRIGGER trg_community_set_updated_at
BEFORE UPDATE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.community_members;
CREATE POLICY "public_read_active" ON public.community_members
  FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "authenticated_insert" ON public.community_members;
CREATE POLICY "authenticated_insert" ON public.community_members
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_update" ON public.community_members;
CREATE POLICY "authenticated_update" ON public.community_members
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_delete" ON public.community_members;
CREATE POLICY "authenticated_delete" ON public.community_members
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.community_members IS 'Community member registry';
