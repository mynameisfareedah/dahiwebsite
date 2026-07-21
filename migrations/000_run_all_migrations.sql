-- 000_run_all_migrations.sql
-- Master idempotent migration script for Supabase SQL Editor
-- Run this entire file in Supabase SQL Editor to create extensions, functions,
-- tables, indexes, triggers, and RLS policies in order.
-- This file is safe to rerun (uses IF NOT EXISTS, DROP POLICY IF EXISTS, etc.)

-- NOTE: If you prefer to run files individually, follow the order listed in Migration_Checklist.md

-- ============================================================
-- 000_extensions_and_triggers.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================
-- 001_create_events.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  category text NOT NULL,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  poster_url text,
  registration_url text,
  registration_deadline timestamptz,
  capacity integer DEFAULT 0 CHECK (capacity >= 0),
  attendees_count integer DEFAULT 0 CHECK (attendees_count >= 0),
  featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','deleted')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'events' AND c.conname = 'events_slug_key'
  ) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events (featured);

DROP TRIGGER IF EXISTS trg_events_set_updated_at ON public.events;
CREATE TRIGGER trg_events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published" ON public.events;
CREATE POLICY "public_read_published" ON public.events
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "authenticated_select_owner_or_published" ON public.events;
CREATE POLICY "authenticated_select_owner_or_published" ON public.events
  FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

DROP POLICY IF EXISTS "authenticated_insert" ON public.events;
CREATE POLICY "authenticated_insert" ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.events;
CREATE POLICY "owner_update" ON public.events
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.events;
CREATE POLICY "owner_delete" ON public.events
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.events IS 'Events table for public site and admin CMS';

-- ============================================================
-- 002_create_resources.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  resource_type text NOT NULL,
  author text,
  file_url text,
  thumbnail_url text,
  downloads integer DEFAULT 0 CHECK (downloads >= 0),
  featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','deleted')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.contype = 'u' AND t.relname = 'resources' AND c.conname = 'resources_slug_key'
  ) THEN
    ALTER TABLE public.resources ADD CONSTRAINT resources_slug_key UNIQUE (slug);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources (slug);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources (status);
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON public.resources (resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON public.resources (featured);

DROP TRIGGER IF EXISTS trg_resources_set_updated_at ON public.resources;
CREATE TRIGGER trg_resources_set_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published" ON public.resources;
CREATE POLICY "public_read_published" ON public.resources
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "authenticated_select_owner_or_published" ON public.resources;
CREATE POLICY "authenticated_select_owner_or_published" ON public.resources
  FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

DROP POLICY IF EXISTS "authenticated_insert" ON public.resources;
CREATE POLICY "authenticated_insert" ON public.resources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "owner_update" ON public.resources;
CREATE POLICY "owner_update" ON public.resources
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "owner_delete" ON public.resources;
CREATE POLICY "owner_delete" ON public.resources
  FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE public.resources IS 'Downloadable resources and documents';

-- ============================================================
-- 003_create_team_members.sql
-- ============================================================

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

-- ============================================================
-- 004_create_messages.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  category text DEFAULT 'general',
  read boolean DEFAULT false,
  archived boolean DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','responded','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages (email);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages (status);

DROP TRIGGER IF EXISTS trg_messages_set_updated_at ON public.messages;
CREATE TRIGGER trg_messages_set_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON public.messages;
CREATE POLICY "authenticated_select" ON public.messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert" ON public.messages;
CREATE POLICY "authenticated_insert" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_update" ON public.messages;
CREATE POLICY "authenticated_update" ON public.messages
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_delete" ON public.messages;
CREATE POLICY "authenticated_delete" ON public.messages
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.messages IS 'Contact form messages and admin messages';

-- ============================================================
-- 005_create_volunteers.sql
-- ============================================================

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

-- ============================================================
-- 006_create_sponsors.sql
-- ============================================================

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

-- ============================================================
-- 007_create_community_members.sql
-- ============================================================

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

-- ============================================================
-- 008_create_settings.sql
-- ============================================================

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

-- ============================================================
-- 009_create_additional_indexes_and_constraints.sql
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_category ON public.messages (category);
CREATE INDEX IF NOT EXISTS idx_community_joined_at ON public.community_members (joined_at);

-- ============================================================
-- 012_create_donations.sql
-- ============================================================

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

-- ============================================================
-- 010_admin_authorization.sql (admin policies for donations)
-- ============================================================

-- ===== DONATIONS ADMIN POLICIES =====
-- Public: SELECT only where active = true (covered above)
-- Admins: full CRUD
DROP POLICY IF EXISTS "admin_select_donations" ON public.donations;
CREATE POLICY "admin_select_donations" ON public.donations
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_donations" ON public.donations;
CREATE POLICY "admin_insert_donations" ON public.donations
  FOR INSERT
  WITH CHECK (public.is_admin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_donations" ON public.donations;
CREATE POLICY "admin_update_donations" ON public.donations
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_donations" ON public.donations;
CREATE POLICY "admin_delete_donations" ON public.donations
  FOR DELETE
  USING (public.is_admin());

-- End of master migration file
