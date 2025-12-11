-- Ensure memorial pages can be viewed by support team members but only managed by admins
-- The existing policies already handle this correctly, but let's verify

-- Ensure only admins can manage support team access (add/remove team members)
-- Drop any overly permissive policies on loved_one_access
DROP POLICY IF EXISTS "Users can insert themselves when accepting invitations" ON public.loved_one_access;

-- Create specific policies for loved_one_access management

-- 1. Admin users can manage access to their loved ones (already exists - good)
-- 2. Users can insert themselves ONLY when accepting valid invitations
CREATE POLICY "Users can accept valid invitations" 
ON public.loved_one_access 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM support_team_invitations sti 
    WHERE sti.loved_one_id = loved_one_access.loved_one_id 
    AND sti.invited_email = auth.email() 
    AND sti.status = 'pending' 
    AND sti.expires_at > now()
  )
);

-- 3. Users can view their own access records (already covered by existing SELECT policy)

-- Add policy to ensure support members cannot delete their own access or others
CREATE POLICY "Only admins can remove team members" 
ON public.loved_one_access 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM loved_ones lo 
    WHERE lo.id = loved_one_access.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);