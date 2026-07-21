-- 012_add_registration_button_text_to_events.sql
-- Adds event registration link fields used by admin/public event CTAs.

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS registration_url text;

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS registration_button_text text;

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS registration_enabled boolean DEFAULT true;

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'open';

DO $$
BEGIN
  ALTER TABLE public.events
    ADD CONSTRAINT events_registration_status_check
    CHECK (registration_status IN ('open', 'coming_soon', 'closed'));
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

UPDATE public.events
SET
  registration_enabled = COALESCE(registration_enabled, true),
  registration_status = COALESCE(registration_status, 'open');
