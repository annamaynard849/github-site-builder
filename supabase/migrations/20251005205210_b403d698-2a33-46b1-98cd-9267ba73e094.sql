-- =====================================================================
-- Security Fix: Prevent Email Exposure on Public Memorial Pages
-- =====================================================================
-- This migration addresses critical security vulnerabilities where visitor
-- email addresses are exposed on public memorial pages in both 
-- memorial_tributes and memorial_memories tables.
-- =====================================================================

-- Step 1: Create secure accessor function for tributes (without emails)
CREATE OR REPLACE FUNCTION public.get_public_tributes(_memorial_page_id uuid)
RETURNS TABLE(
  id uuid,
  author_name text,
  message text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mt.id,
    mt.author_name,
    mt.message,
    mt.created_at
  FROM memorial_tributes mt
  JOIN memorial_pages mp ON mp.id = mt.memorial_page_id
  WHERE mt.memorial_page_id = _memorial_page_id
    AND mt.is_approved = true
    AND mp.is_public = true
    AND mp.privacy_level = 'public';
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_public_tributes TO authenticated, anon;

-- Step 2: Create secure accessor function for memories (without emails)
CREATE OR REPLACE FUNCTION public.get_public_memories(_memorial_page_id uuid)
RETURNS TABLE(
  id uuid,
  file_url text,
  file_type text,
  caption text,
  uploaded_by_name text,
  memory_date date,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mm.id,
    mm.file_url,
    mm.file_type,
    mm.caption,
    mm.uploaded_by_name,
    mm.memory_date,
    mm.created_at
  FROM memorial_memories mm
  JOIN memorial_pages mp ON mp.id = mm.memorial_page_id
  WHERE mm.memorial_page_id = _memorial_page_id
    AND mm.is_approved = true
    AND mp.is_public = true
    AND mp.privacy_level = 'public';
$$;

GRANT EXECUTE ON FUNCTION public.get_public_memories TO authenticated, anon;

-- Step 3: Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view approved tributes on public pages" ON memorial_tributes;
DROP POLICY IF EXISTS "Approved memorial memories are viewable on public pages" ON memorial_memories;

-- Step 4: Create restrictive policies that prevent direct column access
-- These policies deny direct SELECT access, forcing use of the secure functions
CREATE POLICY "Public tributes require sanitized access"
ON memorial_tributes
FOR SELECT
USING (false);

CREATE POLICY "Public memories require sanitized access"
ON memorial_memories
FOR SELECT
USING (false);

-- Note: Existing owner/admin policies remain intact and will take precedence
-- Memorial page owners can still see all tribute and memory details including emails

-- Step 5: Log the security fix
INSERT INTO public.security_logs (event_type, details)
VALUES (
  'security_fix_applied',
  jsonb_build_object(
    'fix', 'email_exposure_prevention',
    'tables', ARRAY['memorial_tributes', 'memorial_memories'],
    'description', 'Created secure accessor functions and restrictive RLS policies to prevent email exposure on public pages',
    'timestamp', now()
  )
);