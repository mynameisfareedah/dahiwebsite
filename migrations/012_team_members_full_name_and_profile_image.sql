-- Add the current Team Members fields while preserving legacy columns for existing deployments.
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS profile_image text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

UPDATE public.team_members
SET full_name = COALESCE(NULLIF(full_name, ''), name)
WHERE full_name IS NULL OR full_name = '';

UPDATE public.team_members
SET profile_image = COALESCE(NULLIF(profile_image, ''), photo_url)
WHERE profile_image IS NULL OR profile_image = '';

ALTER TABLE public.team_members
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN name DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_featured ON public.team_members (featured);

DROP POLICY IF EXISTS "public_read_active" ON public.team_members;
DROP POLICY IF EXISTS "public_read_active_team" ON public.team_members;
CREATE POLICY "public_read_active_team" ON public.team_members
  FOR SELECT
  USING (active = true);

COMMENT ON COLUMN public.team_members.full_name IS 'Public display name for the team member';
COMMENT ON COLUMN public.team_members.profile_image IS 'Public profile image URL';
