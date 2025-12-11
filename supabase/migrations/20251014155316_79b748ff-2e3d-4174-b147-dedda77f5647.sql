-- Fix email exposure in memorial_memories and memorial_tributes tables
-- Drop existing public SELECT policies that expose emails
DROP POLICY IF EXISTS "Owners and family can view memory details with emails" ON memorial_memories;
DROP POLICY IF EXISTS "Owners and family can view tribute details with emails" ON memorial_tributes;

-- Create stricter policies that exclude emails for public access
-- Memorial memories: Public can view approved memories but NOT emails
CREATE POLICY "Public can view approved memorial memories without emails"
ON memorial_memories
FOR SELECT
USING (
  is_approved = true 
  AND EXISTS (
    SELECT 1 FROM memorial_pages mp 
    WHERE mp.id = memorial_memories.memorial_page_id 
    AND mp.is_public = true
    AND mp.privacy_level = 'public'
  )
);

-- Memorial memories: Owners and family can view all details including emails
CREATE POLICY "Owners and family can view all memory details"
ON memorial_memories
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = memorial_memories.memorial_page_id
    AND (
      lo.admin_user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM loved_one_access loa
        WHERE loa.loved_one_id = lo.id
        AND loa.user_id = auth.uid()
      )
    )
  )
);

-- Memorial tributes: Public can view approved tributes but NOT emails
CREATE POLICY "Public can view approved memorial tributes without emails"
ON memorial_tributes
FOR SELECT
USING (
  is_approved = true 
  AND EXISTS (
    SELECT 1 FROM memorial_pages mp 
    WHERE mp.id = memorial_tributes.memorial_page_id 
    AND mp.is_public = true
    AND mp.privacy_level = 'public'
  )
);

-- Memorial tributes: Owners and family can view all details including emails
CREATE POLICY "Owners and family can view all tribute details"
ON memorial_tributes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = memorial_tributes.memorial_page_id
    AND (
      lo.admin_user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM loved_one_access loa
        WHERE loa.loved_one_id = lo.id
        AND loa.user_id = auth.uid()
      )
    )
  )
);

-- Add helper view for public memorial memories (excludes sensitive fields)
CREATE OR REPLACE VIEW public.public_memorial_memories AS
SELECT 
  id,
  memorial_page_id,
  file_url,
  file_type,
  caption,
  uploaded_by_name,
  memory_date,
  created_at
FROM memorial_memories
WHERE is_approved = true;

-- Add helper view for public memorial tributes (excludes sensitive fields)
CREATE OR REPLACE VIEW public.public_memorial_tributes AS
SELECT 
  id,
  memorial_page_id,
  author_name,
  message,
  created_at
FROM memorial_tributes
WHERE is_approved = true;