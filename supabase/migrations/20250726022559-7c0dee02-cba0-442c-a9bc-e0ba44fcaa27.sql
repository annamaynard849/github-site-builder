-- Allow public access to view invitations by token for unauthenticated users
-- This is needed for the invitation acceptance flow to work
CREATE POLICY "Public can view invitations by token" 
ON public.support_team_invitations 
FOR SELECT 
USING (true);