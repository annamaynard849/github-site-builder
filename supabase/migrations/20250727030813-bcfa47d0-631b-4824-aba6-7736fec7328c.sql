-- Add RLS policy to allow users to view loved ones they have access to via support team
CREATE POLICY "Users can view loved ones they have support access to" 
ON public.loved_ones 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM loved_one_access loa 
    WHERE loa.loved_one_id = loved_ones.id 
    AND loa.user_id = auth.uid()
  )
);