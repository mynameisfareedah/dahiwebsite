# Database Setup & Migrations

This document explains how to run the Supabase/Postgres migrations included in the `migrations/` folder.

Requirements
- A Supabase project or Postgres database with `pgcrypto` extension allowed.
- `psql` or Supabase SQL editor access.

Migration order
1. `000_extensions_and_triggers.sql`
2. `001_create_events.sql`
3. `002_create_resources.sql`
4. `003_create_team_members.sql`
5. `004_create_messages.sql`
6. `005_create_volunteers.sql`
7. `006_create_sponsors.sql`
8. `007_create_community_members.sql`
9. `008_create_settings.sql`
10. `009_create_additional_indexes_and_constraints.sql`

How to run (psql)
```bash
psql "postgresql://<user>:<pass>@<host>:5432/<db>" -f migrations/000_extensions_and_triggers.sql
psql "postgresql://<user>:<pass>@<host>:5432/<db>" -f migrations/001_create_events.sql
# ...then run the rest in order
```

How to run (Supabase SQL editor)
- Open the Supabase project dashboard
- Go to SQL Editor → New Query
- Copy and paste the SQL file contents and run in order

How to verify tables
- `\dt public.*` to list tables in psql
- Use Supabase table browser to inspect columns

How to verify indexes
- `SELECT indexname FROM pg_indexes WHERE schemaname='public';`

How to verify triggers
- `SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.events'::regclass;`

How to verify RLS
- `SELECT relrowsecurity FROM pg_class WHERE relname = 'events';` returns true when enabled

Rollback instructions
- Each migration is idempotent but does not include DROP TABLE statements.
- To rollback a single table manually: `DROP TABLE IF EXISTS public.events CASCADE;` then re-run migration.

Notes
- All migrations use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` to be idempotent.
- Row Level Security (RLS) is enabled and basic policies are created; review policies carefully before production.
- Ensure `pgcrypto` extension is permitted in your Supabase project.
