-- Drop existing restrictive policies that prevent invitation acceptance
DROP POLICY IF EXISTS "Users can manage invitations for their loved ones" ON support_team_invitations;
DROP POLICY IF EXISTS "Admin users can manage access to their loved ones" ON loved_one_access;
DROP POLICY IF EXISTS "Users can view access for their loved ones" ON loved_one_access;

-- Create new policies for support_team_invitations
CREATE POLICY "Users can manage invitations for their loved ones" 
ON support_team_invitations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM loved_ones 
  WHERE loved_ones.id = support_team_invitations.loved_one_id 
  AND loved_ones.admin_user_id = auth.uid()
));

CREATE POLICY "Users can update their own invitation when accepting" 
ON support_team_invitations 
FOR UPDATE 
USING (invited_email = auth.email());

-- Create new policies for loved_one_access  
CREATE POLICY "Admin users can manage access to their loved ones" 
ON loved_one_access 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM loved_ones lo 
  WHERE lo.id = loved_one_access.loved_one_id 
  AND lo.admin_user_id = auth.uid()
));

CREATE POLICY "Users can insert themselves when accepting invitations" 
ON loved_one_access 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view access for their loved ones" 
ON loved_one_access 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM loved_ones lo 
    WHERE lo.id = loved_one_access.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);