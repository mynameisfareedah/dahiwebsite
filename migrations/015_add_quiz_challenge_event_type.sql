-- Permit quiz_challenge while preserving nullable event_type values.
-- This migration does not update Events or modify policies, triggers, or privileges.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

LOCK TABLE public.events IN ACCESS EXCLUSIVE MODE;

DO $migration$
DECLARE
  events_table regclass := to_regclass('public.events');
  event_type_attnum smallint;
  event_type_not_null boolean;
  check_count integer;
  current_constraint_name text;
  current_constraint_definition text;
  current_values text[];
  current_literal_count integer;
  expected_existing_values text[] := ARRAY['masterclass', 'outreach_community', 'webinar'];
  expected_quiz_values text[] := ARRAY['masterclass', 'outreach_community', 'quiz_challenge', 'webinar'];
BEGIN
  IF events_table IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.events does not exist';
  END IF;

  SELECT attnum, attnotnull
    INTO event_type_attnum, event_type_not_null
    FROM pg_attribute
   WHERE attrelid = events_table
     AND attname = 'event_type'
     AND NOT attisdropped;

  IF event_type_attnum IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.events.event_type does not exist';
  END IF;

  IF event_type_not_null THEN
    RAISE EXCEPTION
      'Preflight failed: public.events.event_type is NOT NULL; expected nullable behavior';
  END IF;

  SELECT count(*)
    INTO check_count
    FROM pg_constraint
   WHERE conrelid = events_table
     AND contype = 'c'
     AND conkey @> ARRAY[event_type_attnum]::smallint[];

  IF check_count <> 1 THEN
    RAISE EXCEPTION
      'Preflight failed: expected exactly one CHECK constraint involving event_type, found %',
      check_count;
  END IF;

  SELECT conname, pg_get_constraintdef(oid)
    INTO current_constraint_name, current_constraint_definition
    FROM pg_constraint
   WHERE conrelid = events_table
     AND contype = 'c'
     AND conkey = ARRAY[event_type_attnum]::smallint[];

  IF current_constraint_definition IS NULL
     OR current_constraint_definition !~* $pattern$^CHECK[[:space:]]*\([[:space:]]*\(*[[:space:]]*event_type[[:space:]]+IS[[:space:]]+NULL[[:space:]]*\)*[[:space:]]+OR[[:space:]]+\(*[[:space:]]*event_type[[:space:]]*=[[:space:]]*ANY[[:space:]]*\([[:space:]]*ARRAY[[:space:]]*\[[[:space:]]*'(webinar|masterclass|outreach_community|quiz_challenge)'(::text)?([[:space:]]*,[[:space:]]*'(webinar|masterclass|outreach_community|quiz_challenge)'(::text)?)*[[:space:]]*\][[:space:]]*\)[[:space:]]*\)*[[:space:]]*\)$pattern$ THEN
    RAISE EXCEPTION
      'Preflight failed: expected nullable event_type IS NULL OR event_type = ANY(ARRAY[...]) CHECK structure; found: %',
      current_constraint_definition;
  END IF;

  SELECT array_agg(DISTINCT captures[1] ORDER BY captures[1]), count(*)
    INTO current_values, current_literal_count
    FROM regexp_matches(current_constraint_definition, $pattern$'([^']*)'$pattern$, 'g') AS captures;

  IF current_literal_count <> cardinality(current_values) THEN
    RAISE EXCEPTION
      'Preflight failed: duplicate Event Type literals found in CHECK constraint: %',
      current_constraint_definition;
  ELSIF EXISTS (
    SELECT 1
      FROM public.events
     WHERE event_type IS NOT NULL
       AND NOT (event_type = ANY(current_values))
  ) THEN
    RAISE EXCEPTION
      'Preflight failed: existing Events contain an event_type outside the constraint values';
  ELSIF current_values = expected_quiz_values THEN
    RAISE NOTICE 'quiz_challenge is already allowed; no schema change is required';
  ELSIF current_values = expected_existing_values THEN
    EXECUTE format(
      'ALTER TABLE public.events DROP CONSTRAINT %I',
      current_constraint_name
    );
    EXECUTE format(
      'ALTER TABLE public.events ADD CONSTRAINT %I CHECK (event_type IS NULL OR event_type = ANY (ARRAY[''webinar''::text, ''masterclass''::text, ''outreach_community''::text, ''quiz_challenge''::text]))',
      current_constraint_name
    );
  ELSE
    RAISE EXCEPTION
      'Preflight failed: expected exactly the three existing Event Types or the four approved Event Types, found: %',
      current_values;
  END IF;
END
$migration$;

COMMIT;

-- Read-only post-migration verification: inspect the validated constraint and
-- summarize existing values, including NULL, without changing any records.
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition, convalidated
  FROM pg_constraint
 WHERE conrelid = 'public.events'::regclass
   AND contype = 'c'
   AND conkey = ARRAY[(
     SELECT attnum
       FROM pg_attribute
      WHERE attrelid = 'public.events'::regclass
        AND attname = 'event_type'
        AND NOT attisdropped
   )]::smallint[];

SELECT event_type, count(*) AS event_count
  FROM public.events
 GROUP BY event_type
 ORDER BY event_type NULLS FIRST;
