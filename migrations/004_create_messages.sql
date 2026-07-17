-- 004_create_messages.sql
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  category text DEFAULT 'general',
  read boolean DEFAULT false,
  archived boolean DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','responded','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_email ON public.messages (email);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages (status);

DROP TRIGGER IF EXISTS trg_messages_set_updated_at ON public.messages;
CREATE TRIGGER trg_messages_set_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies: only authenticated admins can insert/select/respond; public cannot view messages
DROP POLICY IF EXISTS "authenticated_select" ON public.messages;
CREATE POLICY "authenticated_select" ON public.messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert" ON public.messages;
CREATE POLICY "authenticated_insert" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_update" ON public.messages;
CREATE POLICY "authenticated_update" ON public.messages
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_delete" ON public.messages;
CREATE POLICY "authenticated_delete" ON public.messages
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.messages IS 'Contact form messages and admin messages';
