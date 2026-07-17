-- 001_create_events.sql
-- Idempotent creation of `events` table with RLS and policies

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

-- Unique slug per event
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events (featured);

-- Trigger: update updated_at
DROP TRIGGER IF EXISTS trg_events_set_updated_at ON public.events;
CREATE TRIGGER trg_events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public: allow read of published events
DROP POLICY IF EXISTS "public_read_published" ON public.events;
CREATE POLICY "public_read_published" ON public.events
  FOR SELECT
  USING (status = 'published');

-- Authenticated users: allow select if owner or published
DROP POLICY IF EXISTS "authenticated_select_owner_or_published" ON public.events;
CREATE POLICY "authenticated_select_owner_or_published" ON public.events
  FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

-- Inserts: authenticated users may insert, and created_by must equal auth.uid()
DROP POLICY IF EXISTS "authenticated_insert" ON public.events;
CREATE POLICY "authenticated_insert" ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Updates: only owner may update
DROP POLICY IF EXISTS "owner_update" ON public.events;
CREATE POLICY "owner_update" ON public.events
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Deletes: only owner may delete
DROP POLICY IF EXISTS "owner_delete" ON public.events;
CREATE POLICY "owner_delete" ON public.events
  FOR DELETE
  USING (auth.uid() = created_by);


COMMENT ON TABLE public.events IS 'Events table for public site and admin CMS';
