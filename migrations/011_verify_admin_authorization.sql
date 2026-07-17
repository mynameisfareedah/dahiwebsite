-- 011_verify_admin_authorization.sql
-- Read-only verification script for Supabase admin authorization setup.

-- 1) Verify admin_users table exists
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'admin_users';

-- 2) Verify RLS is enabled on public.admin_users
SELECT relname,
       relrowsecurity,
       relforcerowsecurity
FROM pg_class
WHERE oid = 'public.admin_users'::regclass;

-- 3) List all policies on public.admin_users
SELECT *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'admin_users'
ORDER BY policyname;

-- 4) Verify public.is_admin() function exists
SELECT n.nspname AS schema_name,
       p.proname AS function_name,
       pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin';

-- 5) Count rows in public.admin_users
SELECT COUNT(*) AS admin_user_count
FROM public.admin_users;

-- 6) List all policies for every public table
SELECT *
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
