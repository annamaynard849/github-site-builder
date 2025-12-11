-- Drop existing problematic policies on loved_ones table
DROP POLICY IF EXISTS "Admin users can manage their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can view loved ones they have access to" ON public.loved_ones;

-- Create simple, non-recursive policies for loved_ones table
CREATE POLICY "Users can manage their own loved ones" 
ON public.loved_ones 
FOR ALL 
USING (admin_user_id = auth.uid());

-- Note: For now, we'll keep it simple - only admin users can access their loved ones
-- The family member access will be handled at the application level for now
-- This avoids the recursion issue while maintaining security