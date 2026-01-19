-- Drop the restrictive policies and recreate as permissive

-- Cases table
DROP POLICY IF EXISTS "Users can view their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON public.cases;

CREATE POLICY "Users can view their own cases" 
ON public.cases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" 
ON public.cases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" 
ON public.cases 
FOR DELETE 
USING (auth.uid() = user_id);

-- Loved ones table
DROP POLICY IF EXISTS "Users can view their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can insert their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can update their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can delete their loved ones" ON public.loved_ones;

CREATE POLICY "Users can view their loved ones" 
ON public.loved_ones 
FOR SELECT 
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can insert their loved ones" 
ON public.loved_ones 
FOR INSERT 
WITH CHECK ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can update their loved ones" 
ON public.loved_ones 
FOR UPDATE 
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete their loved ones" 
ON public.loved_ones 
FOR DELETE 
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));