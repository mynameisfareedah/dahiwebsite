-- 009_create_additional_indexes_and_constraints.sql
-- Add any missing indexes, constraints, or foreign keys that span multiple tables

-- Example: ensure events.created_by references auth.users (already added), add constraints for email formats where appropriate

-- Add an index for messages.category
CREATE INDEX IF NOT EXISTS idx_messages_category ON public.messages (category);

-- Add index on community_members.joined_at
CREATE INDEX IF NOT EXISTS idx_community_joined_at ON public.community_members (joined_at);

-- Ensure email columns not null where required already enforced in table creation

-- VACUUM ANALYZE to update planner statistics (optional, useful after migrations run)
