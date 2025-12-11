-- Drop and recreate the insert policy to ensure anonymous access works
DROP POLICY IF EXISTS "Anyone can submit a call request" ON public.call_requests;

-- Create a policy that allows insert for all (including anonymous)
CREATE POLICY "Allow public insert on call_requests"
ON public.call_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);