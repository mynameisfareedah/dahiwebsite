Migration Checklist & Supabase SQL Editor Instructions

Files (run in this exact order):
1. migrations/000_extensions_and_triggers.sql
2. migrations/001_create_events.sql
3. migrations/002_create_resources.sql
4. migrations/003_create_team_members.sql
5. migrations/004_create_messages.sql
6. migrations/005_create_volunteers.sql
7. migrations/006_create_sponsors.sql
8. migrations/007_create_community_members.sql
9. migrations/008_create_settings.sql
10. migrations/009_create_additional_indexes_and_constraints.sql

Or run single master file:
- migrations/000_run_all_migrations.sql

Before you run
- Open Supabase project → SQL Editor → New Query
- Copy-paste the chosen file contents and run
- Run files in order if using individual files
- If any error occurs, stop and copy the full error output and the SQL snippet that failed and send it to me

Verification queries (run in SQL Editor after migrations complete)

-- List created tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Verify columns for a table (replace table_name)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='events'
ORDER BY ordinal_position;

-- Primary key
SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS data_type
FROM   pg_index i
JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
WHERE  i.indrelid = 'public.events'::regclass AND i.indisprimary;

-- Foreign keys
SELECT
  tc.constraint_name, tc.table_name, kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'events';

-- Indexes
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'events';

-- Triggers
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.events'::regclass;

-- Check constraints
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'events' AND c.contype = 'c';

-- Unique constraints
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'events' AND c.contype = 'u';

-- RLS enabled?
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('events','resources','team_members','messages','volunteers','sponsors','community_members','settings');

-- Policies for a table
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'events';

CRUD smoke tests (use SQL Editor run as a logged-in SQL role or via API/pg client):

-- INSERT sample into events (replace created_by with a valid auth.users id if available)
INSERT INTO public.events (title, slug, category, event_date, status) VALUES ('Migration Test Event','migration-test-event','workshop', now()::date, 'published');

-- SELECT
SELECT * FROM public.events WHERE slug = 'migration-test-event';

-- UPDATE
UPDATE public.events SET title = 'Migration Test Event (updated)' WHERE slug = 'migration-test-event';

-- DELETE
DELETE FROM public.events WHERE slug = 'migration-test-event';

Notes & Troubleshooting
- If `gen_random_uuid()` is missing, ensure `pgcrypto` extension ran successfully.
- If policies prevent you from inserting via SQL Editor, log in as a project service role (Supabase web SQL runs as a SQL editor role, which has elevated permissions); alternatively temporarily disable RLS to run smoke inserts.
- Do NOT disable RLS permanently; only for verification and re-enable after testing.

When done, send me:
- The output of the verification queries above, or
- Any errors you encountered running the master file or individual files.

I'll act on any failures: fix migration SQL, update master file, and re-submit instructions.