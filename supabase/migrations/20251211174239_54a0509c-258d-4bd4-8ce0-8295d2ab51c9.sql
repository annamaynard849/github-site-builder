-- Create a table for storing call request form submissions
CREATE TABLE public.call_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.call_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (public form)
CREATE POLICY "Anyone can submit a call request"
ON public.call_requests
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view (you can adjust this later)
CREATE POLICY "Admins can view call requests"
ON public.call_requests
FOR SELECT
USING (false);