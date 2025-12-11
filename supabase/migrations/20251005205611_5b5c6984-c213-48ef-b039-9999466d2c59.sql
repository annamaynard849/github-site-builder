-- =====================================================================
-- Adjustment: Allow public viewing of tributes/memories while hiding emails
-- Rationale: Replace blocking SELECT policies with permissive ones for public
-- content, and prevent email leakage via column-level privileges. Owners can
-- access emails via existing RPCs (e.g., public.get_tribute_contacts).
-- =====================================================================

-- Step 1: Remove the blocking policies introduced earlier
DROP POLICY IF EXISTS "Public tributes require sanitized access" ON public.memorial_tributes;
DROP POLICY IF EXISTS "Public memories require sanitized access" ON public.memorial_memories;

-- Step 2: Recreate public SELECT policies that allow viewing approved items on public pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'memorial_tributes' AND policyname = 'Public can view approved tributes on public pages'
  ) THEN
    CREATE POLICY "Public can view approved tributes on public pages"
    ON public.memorial_tributes
    FOR SELECT
    USING (
      is_approved = true
      AND EXISTS (
        SELECT 1 FROM public.memorial_pages mp
        WHERE mp.id = memorial_tributes.memorial_page_id
          AND mp.is_public = true
          AND mp.privacy_level = 'public'
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'memorial_memories' AND policyname = 'Approved memorial memories are viewable on public pages'
  ) THEN
    CREATE POLICY "Approved memorial memories are viewable on public pages"
    ON public.memorial_memories
    FOR SELECT
    USING (
      is_approved = true
      AND EXISTS (
        SELECT 1 FROM public.memorial_pages mp
        WHERE mp.id = memorial_memories.memorial_page_id
          AND mp.is_public = true
          AND mp.privacy_level = 'public'
      )
    );
  END IF;
END $$;

-- Step 3: Prevent exposure of sensitive email columns via column-level privileges
-- Revoke for anon and authenticated (owners can use RPCs to retrieve emails)
REVOKE SELECT (author_email) ON TABLE public.memorial_tributes FROM anon, authenticated;
REVOKE SELECT (uploaded_by_email) ON TABLE public.memorial_memories FROM anon, authenticated;

-- Ensure service_role retains access for backend/admin operations
GRANT SELECT (author_email) ON TABLE public.memorial_tributes TO service_role;
GRANT SELECT (uploaded_by_email) ON TABLE public.memorial_memories TO service_role;

-- Audit log
INSERT INTO public.security_logs (event_type, details)
VALUES (
  'security_fix_adjustment',
  jsonb_build_object(
    'fix', 'restore_public_view_hide_emails',
    'tables', ARRAY['memorial_tributes', 'memorial_memories'],
    'description', 'Restored public SELECT for approved content with column-level email protection; owners can access emails via RPC only.',
    'timestamp', now()
  )
);