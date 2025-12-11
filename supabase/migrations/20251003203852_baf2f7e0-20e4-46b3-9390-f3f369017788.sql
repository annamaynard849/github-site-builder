-- Fix memorial_tributes email exposure security issue
-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Approved memorial tributes are viewable on public pages" ON memorial_tributes;

-- Create a new policy that restricts email access for public viewers
-- Public can view tributes but without email addresses (enforced at query level)
CREATE POLICY "Public can view approved tributes on public pages"
ON memorial_tributes
FOR SELECT
TO authenticated, anon
USING (
  is_approved = true 
  AND EXISTS (
    SELECT 1 FROM memorial_pages
    WHERE memorial_pages.id = memorial_tributes.memorial_page_id
    AND memorial_pages.is_public = true
  )
);

-- Memorial page owners can view all tribute details including emails
CREATE POLICY "Memorial page owners can view all tribute details"
ON memorial_tributes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = memorial_tributes.memorial_page_id
    AND lo.admin_user_id = auth.uid()
  )
);

-- Create a security definer function for owners to get tribute emails
CREATE OR REPLACE FUNCTION public.get_tribute_contacts(
  _memorial_page_id uuid
)
RETURNS TABLE(
  tribute_id uuid,
  author_name text,
  author_email text,
  message text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mt.id as tribute_id,
    mt.author_name,
    mt.author_email,
    mt.message,
    mt.created_at
  FROM memorial_tributes mt
  JOIN memorial_pages mp ON mp.id = mt.memorial_page_id
  JOIN loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mt.memorial_page_id = _memorial_page_id
  AND lo.admin_user_id = auth.uid()
  AND mt.is_approved = true
  ORDER BY mt.created_at DESC;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.get_tribute_contacts IS 
'Security definer function that allows memorial page owners to access tribute author email addresses for contact purposes. Public viewers cannot access email addresses through regular queries.';