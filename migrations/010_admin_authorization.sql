-- 010_admin_authorization.sql
-- Add admin_users table, create is_admin() helper, and tighten RLS policies
-- Idempotent: uses IF NOT EXISTS, CREATE OR REPLACE FUNCTION, and DROP POLICY IF EXISTS

-- 1) admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE,
  role text DEFAULT 'admin',
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2) is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.active = true
      AND au.role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "admin_users_admin_select" ON public.admin_users;
CREATE POLICY "admin_users_admin_select" ON public.admin_users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_users_admin_insert" ON public.admin_users;
CREATE POLICY "admin_users_admin_insert" ON public.admin_users
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_users_admin_update" ON public.admin_users;
CREATE POLICY "admin_users_admin_update" ON public.admin_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_users_admin_delete" ON public.admin_users;
CREATE POLICY "admin_users_admin_delete" ON public.admin_users
  FOR DELETE
  USING (auth.uid() = id);

-- 3) Policies updated to match DAHI site requirements

-- ===== MESSAGES =====
-- Allow anonymous INSERT (public contact form). No public SELECT/UPDATE/DELETE.
DROP POLICY IF EXISTS "anonymous_insert" ON public.messages;
CREATE POLICY "anonymous_insert" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- Admins may insert/select/update/delete
DROP POLICY IF EXISTS "admin_insert_messages" ON public.messages;
CREATE POLICY "admin_insert_messages" ON public.messages
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_select_messages" ON public.messages;
CREATE POLICY "admin_select_messages" ON public.messages
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_messages" ON public.messages;
CREATE POLICY "admin_update_messages" ON public.messages
  FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_messages" ON public.messages;
CREATE POLICY "admin_delete_messages" ON public.messages
  FOR DELETE
  USING (public.is_admin());

-- ===== RESOURCES =====
-- Public: SELECT only where status = 'published'
DROP POLICY IF EXISTS "public_read_published" ON public.resources;
CREATE POLICY "public_read_published" ON public.resources
  FOR SELECT
  USING (status = 'published');

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_select_resources" ON public.resources;
CREATE POLICY "admin_select_resources" ON public.resources
  FOR SELECT
  USING (public.is_admin() OR auth.uid() = created_by);

DROP POLICY IF EXISTS "admin_insert_resources" ON public.resources;
CREATE POLICY "admin_insert_resources" ON public.resources
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_resources" ON public.resources;
CREATE POLICY "admin_update_resources" ON public.resources
  FOR UPDATE
  USING (public.is_admin() OR auth.uid() = created_by)
  WITH CHECK (public.is_admin() OR auth.uid() = created_by);

DROP POLICY IF EXISTS "admin_delete_resources" ON public.resources;
CREATE POLICY "admin_delete_resources" ON public.resources
  FOR DELETE
  USING (public.is_admin() OR auth.uid() = created_by);

-- ===== TEAM MEMBERS =====
-- Public: SELECT only where active = true
DROP POLICY IF EXISTS "public_read_active_team" ON public.team_members;
CREATE POLICY "public_read_active_team" ON public.team_members
  FOR SELECT
  USING (active = true AND status = 'active');

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_select_team" ON public.team_members;
CREATE POLICY "admin_select_team" ON public.team_members
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_team" ON public.team_members;
CREATE POLICY "admin_insert_team" ON public.team_members
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_team" ON public.team_members;
CREATE POLICY "admin_update_team" ON public.team_members
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_team" ON public.team_members;
CREATE POLICY "admin_delete_team" ON public.team_members
  FOR DELETE
  USING (public.is_admin());

-- ===== VOLUNTEERS =====
-- Allow anonymous INSERT (public volunteer sign-up). No public SELECT/UPDATE/DELETE.
DROP POLICY IF EXISTS "anonymous_insert_volunteers" ON public.volunteers;
CREATE POLICY "anonymous_insert_volunteers" ON public.volunteers
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_insert_volunteers" ON public.volunteers;
CREATE POLICY "admin_insert_volunteers" ON public.volunteers
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_select_volunteers" ON public.volunteers;
CREATE POLICY "admin_select_volunteers" ON public.volunteers
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_volunteers" ON public.volunteers;
CREATE POLICY "admin_update_volunteers" ON public.volunteers
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_volunteers" ON public.volunteers;
CREATE POLICY "admin_delete_volunteers" ON public.volunteers
  FOR DELETE
  USING (public.is_admin());

-- ===== SPONSORS =====
-- Public: SELECT only where active = true
DROP POLICY IF EXISTS "public_read_active_sponsors" ON public.sponsors;
CREATE POLICY "public_read_active_sponsors" ON public.sponsors
  FOR SELECT
  USING (active = true AND status = 'active');

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_select_sponsors" ON public.sponsors;
CREATE POLICY "admin_select_sponsors" ON public.sponsors
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_sponsors" ON public.sponsors;
CREATE POLICY "admin_insert_sponsors" ON public.sponsors
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_sponsors" ON public.sponsors;
CREATE POLICY "admin_update_sponsors" ON public.sponsors
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_sponsors" ON public.sponsors;
CREATE POLICY "admin_delete_sponsors" ON public.sponsors
  FOR DELETE
  USING (public.is_admin());

-- ===== COMMUNITY MEMBERS =====
-- Allow anonymous INSERT (public join). No public SELECT/UPDATE/DELETE.
DROP POLICY IF EXISTS "anonymous_insert_community" ON public.community_members;
CREATE POLICY "anonymous_insert_community" ON public.community_members
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL);

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_insert_community" ON public.community_members;
CREATE POLICY "admin_insert_community" ON public.community_members
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_select_community" ON public.community_members;
CREATE POLICY "admin_select_community" ON public.community_members
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_community" ON public.community_members;
CREATE POLICY "admin_update_community" ON public.community_members
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_community" ON public.community_members;
CREATE POLICY "admin_delete_community" ON public.community_members
  FOR DELETE
  USING (public.is_admin());

-- ===== SETTINGS =====
-- Admin only
DROP POLICY IF EXISTS "admin_select_settings" ON public.settings;
CREATE POLICY "admin_select_settings" ON public.settings
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_settings" ON public.settings;
CREATE POLICY "admin_insert_settings" ON public.settings
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_settings" ON public.settings;
CREATE POLICY "admin_update_settings" ON public.settings
  FOR UPDATE
  USING (public.is_admin() OR auth.uid() = created_by)
  WITH CHECK (public.is_admin() OR auth.uid() = created_by);

-- ===== EVENTS =====
-- Public: SELECT only where status = 'published'
DROP POLICY IF EXISTS "public_read_published_events" ON public.events;
CREATE POLICY "public_read_published_events" ON public.events
  FOR SELECT
  USING (status = 'published');

-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_insert_events" ON public.events;
CREATE POLICY "admin_insert_events" ON public.events
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_events" ON public.events;
CREATE POLICY "admin_update_events" ON public.events
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_events" ON public.events;
CREATE POLICY "admin_delete_events" ON public.events
  FOR DELETE
  USING (public.is_admin());

-- End of 010_admin_authorization.sql
