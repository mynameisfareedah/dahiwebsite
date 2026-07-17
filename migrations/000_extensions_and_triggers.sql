-- 000_extensions_and_triggers.sql
-- Ensure pgcrypto for gen_random_uuid and timestamp trigger function

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Note: Triggers for individual tables are created in each migration (DROP TRIGGER IF EXISTS ... THEN CREATE TRIGGER ...)
