-- Drop the old table and recreate fresh
DROP TABLE IF EXISTS public.call_requests;

-- Create fresh call_requests table
CREATE TABLE public.call_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Public can insert call requests"
ON public.call_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);