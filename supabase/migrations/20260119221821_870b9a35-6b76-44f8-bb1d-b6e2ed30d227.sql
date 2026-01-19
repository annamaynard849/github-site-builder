-- Drop and recreate policies explicitly as PERMISSIVE

-- Cases table
DROP POLICY IF EXISTS "Users can view their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON public.cases;

CREATE POLICY "Users can view their own cases" 
ON public.cases 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cases" 
ON public.cases 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases" 
ON public.cases 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases" 
ON public.cases 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Loved ones table
DROP POLICY IF EXISTS "Users can view their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can insert their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can update their loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can delete their loved ones" ON public.loved_ones;

CREATE POLICY "Users can view their loved ones" 
ON public.loved_ones 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can insert their loved ones" 
ON public.loved_ones 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can update their loved ones" 
ON public.loved_ones 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete their loved ones" 
ON public.loved_ones 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING ((auth.uid() = admin_user_id) OR (auth.uid() = user_id));

-- Profiles table  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Onboarding answers table
DROP POLICY IF EXISTS "Users can view their own onboarding answers" ON public.onboarding_answers;
DROP POLICY IF EXISTS "Users can insert their own onboarding answers" ON public.onboarding_answers;
DROP POLICY IF EXISTS "Users can update their own onboarding answers" ON public.onboarding_answers;

CREATE POLICY "Users can view their own onboarding answers" 
ON public.onboarding_answers 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding answers" 
ON public.onboarding_answers 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding answers" 
ON public.onboarding_answers 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Tasks table
DROP POLICY IF EXISTS "Users can view tasks for their loved ones" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks for their loved ones" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks for their loved ones" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks for their loved ones" ON public.tasks;

CREATE POLICY "Users can view tasks for their loved ones" 
ON public.tasks 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND ((lo.admin_user_id = auth.uid()) OR (lo.user_id = auth.uid()))
  ) 
  OR assigned_to_user_id = auth.uid() 
  OR created_by_user_id = auth.uid()
);

CREATE POLICY "Users can insert tasks for their loved ones" 
ON public.tasks 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND ((lo.admin_user_id = auth.uid()) OR (lo.user_id = auth.uid()))
  ) 
  OR created_by_user_id = auth.uid()
);

CREATE POLICY "Users can update tasks for their loved ones" 
ON public.tasks 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND ((lo.admin_user_id = auth.uid()) OR (lo.user_id = auth.uid()))
  ) 
  OR assigned_to_user_id = auth.uid() 
  OR created_by_user_id = auth.uid()
);

CREATE POLICY "Users can delete tasks for their loved ones" 
ON public.tasks 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = tasks.loved_one_id 
    AND ((lo.admin_user_id = auth.uid()) OR (lo.user_id = auth.uid()))
  ) 
  OR created_by_user_id = auth.uid()
);