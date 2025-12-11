-- Fix infinite recursion by using a security definer function
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view loved ones they have support access to" ON public.loved_ones;

-- Create a security definer function to check user access without triggering RLS
CREATE OR REPLACE FUNCTION public.user_has_loved_one_access(_loved_one_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM loved_one_access
    WHERE loved_one_id = _loved_one_id
      AND user_id = _user_id
  );
$$;

-- Now create the policy using the security definer function
CREATE POLICY "Users can view loved ones they have support access to" 
ON public.loved_ones 
FOR SELECT 
USING (public.user_has_loved_one_access(loved_ones.id, auth.uid()));