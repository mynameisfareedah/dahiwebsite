-- Create events table with proper structure and RLS
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  category text DEFAULT 'general',
  capacity integer DEFAULT 0,
  attendees integer DEFAULT 0,
  poster_url text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_capacity CHECK (capacity >= 0),
  CONSTRAINT valid_attendees CHECK (attendees >= 0 AND attendees <= capacity)
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can do everything
CREATE POLICY "Admins can CRUD events"
  ON events
  FOR ALL
  USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' LIKE '%@dahi%' OR
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' LIKE '%@dahi%' OR
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
  );

-- Policy 2: Public can read published events
CREATE POLICY "Public can view published events"
  ON events
  FOR SELECT
  USING (status IN ('scheduled', 'completed'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
