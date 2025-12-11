-- Fix memorial tributes email exposure security issue
-- The existing get_public_tributes function already excludes emails,
-- but the RLS policy allows direct SELECT access to all columns.
-- We need to remove public SELECT access and force use of the safe function.

-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Public can view approved tributes on public pages" ON memorial_tributes;

-- Create a new policy that only allows authenticated memorial page owners to see full details including emails
CREATE POLICY "Owners and family can view tribute details with emails"
ON memorial_tributes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = memorial_tributes.memorial_page_id
    AND (
      -- Memorial page owner
      lo.admin_user_id = auth.uid()
      -- OR family members with access
      OR EXISTS (
        SELECT 1
        FROM loved_one_access loa
        WHERE loa.loved_one_id = lo.id
        AND loa.user_id = auth.uid()
      )
    )
  )
);

-- Note: Public users (unauthenticated) should use the get_public_tributes() function
-- which returns only safe fields (id, author_name, message, created_at) without email addresses.
-- This function already has proper security and excludes sensitive information.

-- Similarly, fix memorial_memories to not expose uploaded_by_email to public
DROP POLICY IF EXISTS "Approved memorial memories are viewable on public pages" ON memorial_memories;

CREATE POLICY "Owners and family can view memory details with emails"
ON memorial_memories
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = memorial_memories.memorial_page_id
    AND (
      -- Memorial page owner
      lo.admin_user_id = auth.uid()
      -- OR family members with access
      OR EXISTS (
        SELECT 1
        FROM loved_one_access loa
        WHERE loa.loved_one_id = lo.id
        AND loa.user_id = auth.uid()
      )
    )
  )
);

-- Create a public-safe function for memories too (similar to tributes)
CREATE OR REPLACE FUNCTION public.get_public_memorial_memories(_memorial_page_id uuid)
RETURNS TABLE(
  id uuid,
  file_url text,
  file_type text,
  caption text,
  uploaded_by_name text,
  memory_date date,
  created_at timestamp with time zone
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
    AND mp.privacy_level = 'public'
  ORDER BY mm.created_at DESC;
$$;

COMMENT ON FUNCTION public.get_public_memorial_memories IS 'Safe function for public access to memorial memories - excludes email addresses and other sensitive information';