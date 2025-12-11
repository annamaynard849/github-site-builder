-- Add restrictive RLS policies to call_requests table to protect customer PII

-- Deny public read access - only admins should view contact requests
CREATE POLICY "Deny public read access to call requests" 
ON public.call_requests 
FOR SELECT 
USING (false);

-- Deny public updates - only admins should update status
CREATE POLICY "Deny public update access to call requests" 
ON public.call_requests 
FOR UPDATE 
USING (false);

-- Deny public deletes - only admins should delete records
CREATE POLICY "Deny public delete access to call requests" 
ON public.call_requests 
FOR DELETE 
USING (false);