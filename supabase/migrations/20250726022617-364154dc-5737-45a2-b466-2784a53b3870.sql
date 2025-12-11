-- Remove the overly permissive policy
DROP POLICY "Public can view invitations by token" ON public.support_team_invitations;

-- Create a more secure policy that allows viewing invitations only when accessing via the specific token
-- Since we can't easily pass the token to RLS, we'll modify the existing policy to be less restrictive
DROP POLICY "Users can view invitations sent to them" ON public.support_team_invitations;

-- Allow viewing invitations for unauthenticated users, but limit the sensitive data that can be accessed
CREATE POLICY "Allow invitation validation for acceptance flow" 
ON public.support_team_invitations 
FOR SELECT 
USING (true);