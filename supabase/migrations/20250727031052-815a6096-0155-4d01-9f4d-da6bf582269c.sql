-- Update task management policies to implement proper role-based permissions

-- Drop the existing broad management policy
DROP POLICY IF EXISTS "Users can manage tasks for accessible loved ones" ON public.tasks;

-- Create specific policies for different roles and actions

-- 1. Admin users can manage all tasks for their loved ones
CREATE POLICY "Admin users can manage all tasks for their loved ones" 
ON public.tasks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM loved_ones lo 
    WHERE lo.id = tasks.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);

-- 2. Family members can manage all tasks for loved ones they have access to
CREATE POLICY "Family members can manage all tasks" 
ON public.tasks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM loved_ones lo 
    JOIN loved_one_access loa ON loa.loved_one_id = lo.id 
    WHERE lo.id = tasks.loved_one_id 
    AND loa.user_id = auth.uid() 
    AND loa.role = 'family_member'
  )
);

-- 3. Support members can only update their own assigned tasks (status, completed_at)
CREATE POLICY "Support members can update their assigned tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  tasks.assigned_to_user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM loved_ones lo 
    JOIN loved_one_access loa ON loa.loved_one_id = lo.id 
    WHERE lo.id = tasks.loved_one_id 
    AND loa.user_id = auth.uid() 
    AND loa.role = 'support_member'
  )
)
WITH CHECK (
  tasks.assigned_to_user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM loved_ones lo 
    JOIN loved_one_access loa ON loa.loved_one_id = lo.id 
    WHERE lo.id = tasks.loved_one_id 
    AND loa.user_id = auth.uid() 
    AND loa.role = 'support_member'
  )
);