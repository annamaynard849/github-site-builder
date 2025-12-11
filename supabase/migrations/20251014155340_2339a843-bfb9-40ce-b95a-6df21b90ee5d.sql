-- Fix security definer view warnings by making views security invoker
DROP VIEW IF EXISTS public.public_memorial_memories;
DROP VIEW IF EXISTS public.public_memorial_tributes;

CREATE VIEW public.public_memorial_memories
WITH (security_invoker = true) AS
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

CREATE VIEW public.public_memorial_tributes
WITH (security_invoker = true) AS
SELECT 
  id,
  memorial_page_id,
  author_name,
  message,
  created_at
FROM memorial_tributes
WHERE is_approved = true;