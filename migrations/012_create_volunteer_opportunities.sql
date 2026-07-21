-- 012_create_volunteer_opportunities.sql
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  type text NOT NULL CHECK (type IN ('Physical', 'Virtual', 'Hybrid')),
  commitment text,
  skills_required text,
  image_url text,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_slug ON public.volunteer_opportunities (slug);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_active ON public.volunteer_opportunities (active);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_featured ON public.volunteer_opportunities (featured);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_display_order ON public.volunteer_opportunities (display_order DESC);
CREATE INDEX IF NOT EXISTS idx_volunteer_opportunities_type ON public.volunteer_opportunities (type);

DROP TRIGGER IF EXISTS trg_volunteer_opportunities_set_updated_at ON public.volunteer_opportunities;
CREATE TRIGGER trg_volunteer_opportunities_set_updated_at
BEFORE UPDATE ON public.volunteer_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.volunteer_opportunities;
CREATE POLICY "public_read_active" ON public.volunteer_opportunities
  FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "authenticated_select_all" ON public.volunteer_opportunities;
CREATE POLICY "authenticated_select_all" ON public.volunteer_opportunities
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert" ON public.volunteer_opportunities;
CREATE POLICY "authenticated_insert" ON public.volunteer_opportunities
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.volunteer_opportunities;
CREATE POLICY "owner_update" ON public.volunteer_opportunities
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.volunteer_opportunities;
CREATE POLICY "owner_delete" ON public.volunteer_opportunities
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create audit log entry for table creation
INSERT INTO public.audit_logs (table_name, operation, record_id, user_id, changes, timestamp)
VALUES ('volunteer_opportunities', 'CREATE TABLE', null, auth.uid(), '{"action": "Created volunteer_opportunities table"}', now())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.volunteer_opportunities IS 'Volunteer opportunities managed by admins';
