-- 002_add_registration_fields.sql
-- Adds registration link fields to the events table for event-specific registration CTAs.

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS registration_url text;

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS registration_button_text text;

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS registration_enabled boolean DEFAULT true;

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'open';

DO $$
BEGIN
  ALTER TABLE events
    ADD CONSTRAINT events_registration_status_check
    CHECK (registration_status IN ('open', 'coming_soon', 'closed'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

UPDATE events
SET
  registration_enabled = COALESCE(registration_enabled, true),
  registration_status = COALESCE(registration_status, 'open');
