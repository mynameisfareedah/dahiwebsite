-- Adds optional multi-day dates and per-session schedules to public.events.
-- Production was updated separately; retain this file as reference documentation only.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $$
DECLARE
  events_table regclass := to_regclass('public.events');
  event_date_type text;
  event_date_nullable text;
  start_time_type text;
  capacity_nullable text;
  capacity_default text;
  end_date_type text;
  schedule_type text;
  existing_check text;
BEGIN
  IF events_table IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.events does not exist';
  END IF;

  SELECT data_type, is_nullable INTO event_date_type, event_date_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_date';

  SELECT data_type INTO start_time_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_time';

  SELECT is_nullable, column_default INTO capacity_nullable, capacity_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'capacity';

  IF event_date_type IS DISTINCT FROM 'date' THEN
    RAISE EXCEPTION 'Preflight failed: public.events.event_date must exist with type date';
  END IF;

  IF event_date_nullable IS DISTINCT FROM 'NO' THEN
    RAISE EXCEPTION 'Preflight failed: public.events.event_date must remain NOT NULL';
  END IF;

  IF start_time_type IS DISTINCT FROM 'time without time zone' THEN
    RAISE EXCEPTION 'Preflight failed: public.events.start_time must exist with type time without time zone';
  END IF;

  IF capacity_nullable IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.events.capacity does not exist';
  END IF;

  IF capacity_nullable = 'NO' AND capacity_default IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: capacity is required without a database default; review insert compatibility before deploying';
  END IF;

  SELECT data_type INTO end_date_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_end_date';

  IF end_date_type IS NOT NULL AND end_date_type IS DISTINCT FROM 'date' THEN
    RAISE EXCEPTION 'Preflight failed: existing public.events.event_end_date is not type date';
  END IF;

  SELECT data_type INTO schedule_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_schedule';

  IF schedule_type IS NOT NULL AND schedule_type IS DISTINCT FROM 'jsonb' THEN
    RAISE EXCEPTION 'Preflight failed: existing public.events.event_schedule is not type jsonb';
  END IF;

  SELECT regexp_replace(lower(pg_get_constraintdef(oid)), '[[:space:]()"]', '', 'g')
  INTO existing_check
  FROM pg_constraint
  WHERE conrelid = events_table
    AND conname = 'events_event_end_date_not_before_start_check';

  IF existing_check IS NOT NULL
    AND existing_check IS DISTINCT FROM 'checkevent_end_dateisnullorevent_end_date>=event_date' THEN
    RAISE EXCEPTION 'Preflight failed: existing events_event_end_date_not_before_start_check has a different definition';
  END IF;
END;
$$;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_end_date date,
  ADD COLUMN IF NOT EXISTS event_schedule jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.events'::regclass
      AND conname = 'events_event_end_date_not_before_start_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_event_end_date_not_before_start_check
      CHECK (event_end_date IS NULL OR event_end_date >= event_date)
      NOT VALID;
  END IF;
END;
$$;

ALTER TABLE public.events
  VALIDATE CONSTRAINT events_event_end_date_not_before_start_check;

COMMIT;

-- Read-only post-migration verification.
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'events'
  AND column_name IN ('event_date', 'start_time', 'capacity', 'event_end_date', 'event_schedule')
ORDER BY column_name;

SELECT
  conname,
  pg_get_constraintdef(oid) AS definition,
  convalidated
FROM pg_constraint
WHERE conrelid = 'public.events'::regclass
  AND conname = 'events_event_end_date_not_before_start_check';

SELECT count(*) AS event_count
FROM public.events;
