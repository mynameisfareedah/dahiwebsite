# Phase 6: Supabase Integration Setup Guide

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: DAHI Admin (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select closest to your users
5. Click "Create new project" and wait for initialization

## Step 2: Get Your Credentials

1. Go to **Settings > API** in your Supabase project
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Step 3: Configure Environment Variables

1. Open `.env.local` in the project root
2. Add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Save the file (do NOT commit to git)

## Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy the SQL from: `supabase/migrations/001_create_events_table.sql`
4. Paste and click "Run"

## Step 5: Create Admin Users Table (for RLS)

Run this SQL query in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own profile"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');
```

## Step 6: Create Supabase Auth Users

1. Go to **Authentication > Users** in Supabase
2. Click "Add user"
3. Create admin account(s) with:
   - Email: admin@dahi.org (or your admin email)
   - Password: Strong password
4. After creating, add to `admin_users` table:
   ```sql
   INSERT INTO admin_users (user_id, email, role)
   SELECT id, email, 'admin'
   FROM auth.users
   WHERE email = 'admin@dahi.org';
   ```

## Step 7: Test the Connection

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3001/admin/login
3. Log in with your Supabase admin credentials
4. Create a test event
5. Check Supabase dashboard to verify data was saved

## Troubleshooting

### Error: "Supabase credentials not configured"
- Check `.env.local` has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Restart dev server after updating `.env.local`

### Error: "User not authorized"
- Verify user exists in Supabase Authentication > Users
- Check RLS policies allow admin access
- User email must be in `admin_users` table

### Error: "Connection timeout"
- Check internet connection
- Verify Supabase project is running (check dashboard)
- Confirm VITE_SUPABASE_URL is correct

### Events not appearing
- Check Supabase > Table Editor > events for data
- Verify RLS policies are set correctly
- Check browser console for errors

## Security Notes

⚠️ **DO NOT**:
- Commit `.env.local` to version control
- Share API keys in public repositories
- Use service role key in client code

✅ **DO**:
- Use Row Level Security (RLS) on all tables
- Validate all inputs on backend
- Restrict admin operations to authenticated users
- Regularly rotate API keys
