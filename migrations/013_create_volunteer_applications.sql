-- 013_create_volunteer_applications.sql
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  gender text,
  state text,
  country text,
  occupation text,
  skills text,
  availability text,
  interest text,
  experience text,
  motivation text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON public.volunteer_applications (email);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON public.volunteer_applications (status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_created_at ON public.volunteer_applications (created_at);

DROP TRIGGER IF EXISTS trg_volunteer_applications_set_updated_at ON public.volunteer_applications;
CREATE TRIGGER trg_volunteer_applications_set_updated_at
BEFORE UPDATE ON public.volunteer_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anonymous_insert_volunteer_applications" ON public.volunteer_applications;
CREATE POLICY "anonymous_insert_volunteer_applications" ON public.volunteer_applications
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

DROP POLICY IF EXISTS "admin_select_volunteer_applications" ON public.volunteer_applications;
CREATE POLICY "admin_select_volunteer_applications" ON public.volunteer_applications
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_volunteer_applications" ON public.volunteer_applications;
CREATE POLICY "admin_update_volunteer_applications" ON public.volunteer_applications
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.volunteer_applications IS 'Public volunteer applications submitted through the website';
