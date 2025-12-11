-- Drop the restrictive INSERT policy and create a permissive one
DROP POLICY IF EXISTS "Public can insert call requests" ON public.call_requests;

-- Create a permissive INSERT policy for public access (contact form)
CREATE POLICY "Anyone can submit call requests" 
ON public.call_requests 
FOR INSERT 
WITH CHECK (true);