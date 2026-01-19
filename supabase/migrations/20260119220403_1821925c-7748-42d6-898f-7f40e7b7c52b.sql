-- Align onboarding tables with app code expectations

-- loved_ones: app uses admin_user_id + first_name/last_name (not name/user_id)
ALTER TABLE public.loved_ones
  ADD COLUMN IF NOT EXISTS admin_user_id uuid,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS relationship_to_user text;

-- Relax legacy columns so inserts from onboarding don't fail
DO $$
BEGIN
  -- drop NOT NULL on user_id if present
  BEGIN
    ALTER TABLE public.loved_ones ALTER COLUMN user_id DROP NOT NULL;
  EXCEPTION WHEN undefined_column THEN
    -- ignore
  END;

  BEGIN
    ALTER TABLE public.loved_ones ALTER COLUMN name DROP NOT NULL;
  EXCEPTION WHEN undefined_column THEN
    -- ignore
  END;
END $$;

-- FK for admin_user_id (optional but helps integrity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loved_ones_admin_user_id_fkey'
  ) THEN
    ALTER TABLE public.loved_ones
      ADD CONSTRAINT loved_ones_admin_user_id_fkey
      FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_loved_ones_admin_user_id ON public.loved_ones(admin_user_id);

-- Replace loved_ones RLS policies to use admin_user_id
DROP POLICY IF EXISTS "Users can view their own loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can insert their own loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can update their own loved ones" ON public.loved_ones;
DROP POLICY IF EXISTS "Users can delete their own loved ones" ON public.loved_ones;

CREATE POLICY "Users can view their loved ones" ON public.loved_ones
FOR SELECT USING (
  auth.uid() = admin_user_id OR auth.uid() = user_id
);

CREATE POLICY "Users can insert their loved ones" ON public.loved_ones
FOR INSERT WITH CHECK (
  auth.uid() = admin_user_id OR auth.uid() = user_id
);

CREATE POLICY "Users can update their loved ones" ON public.loved_ones
FOR UPDATE USING (
  auth.uid() = admin_user_id OR auth.uid() = user_id
);

CREATE POLICY "Users can delete their loved ones" ON public.loved_ones
FOR DELETE USING (
  auth.uid() = admin_user_id OR auth.uid() = user_id
);


-- onboarding_answers: app inserts completion_pct
ALTER TABLE public.onboarding_answers
  ADD COLUMN IF NOT EXISTS completion_pct integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_answers_user_loved_one_uniq'
  ) THEN
    ALTER TABLE public.onboarding_answers
      ADD CONSTRAINT onboarding_answers_user_loved_one_uniq UNIQUE (user_id, loved_one_id);
  END IF;
END $$;


-- tasks: app expects assigned_to_user_id, created_by_user_id, is_custom, is_personalized
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assigned_to_user_id uuid,
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_personalized boolean NOT NULL DEFAULT false;

-- Add FKs to profiles.user_id (matches TaskDashboard join)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_assigned_to_user_id_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_assigned_to_user_id_fkey
      FOREIGN KEY (assigned_to_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_created_by_user_id_fkey
      FOREIGN KEY (created_by_user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_loved_one_id ON public.tasks(loved_one_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_user_id ON public.tasks(assigned_to_user_id);

-- Replace tasks RLS policies so inserts don't require user_id column
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view tasks for their loved ones" ON public.tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id
      AND (lo.admin_user_id = auth.uid() OR lo.user_id = auth.uid())
  )
  OR tasks.assigned_to_user_id = auth.uid()
  OR tasks.created_by_user_id = auth.uid()
);

CREATE POLICY "Users can insert tasks for their loved ones" ON public.tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id
      AND (lo.admin_user_id = auth.uid() OR lo.user_id = auth.uid())
  )
  OR tasks.created_by_user_id = auth.uid()
);

CREATE POLICY "Users can update tasks for their loved ones" ON public.tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id
      AND (lo.admin_user_id = auth.uid() OR lo.user_id = auth.uid())
  )
  OR tasks.assigned_to_user_id = auth.uid()
  OR tasks.created_by_user_id = auth.uid()
);

CREATE POLICY "Users can delete tasks for their loved ones" ON public.tasks
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.loved_ones lo
    WHERE lo.id = tasks.loved_one_id
      AND (lo.admin_user_id = auth.uid() OR lo.user_id = auth.uid())
  )
  OR tasks.created_by_user_id = auth.uid()
);


-- cases: CurrentCaseContext expects preplan_case_id
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS preplan_case_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_preplan_case_id_fkey'
  ) THEN
    ALTER TABLE public.cases
      ADD CONSTRAINT cases_preplan_case_id_fkey
      FOREIGN KEY (preplan_case_id) REFERENCES public.cases(id) ON DELETE SET NULL;
  END IF;
END $$;


-- Security linter: remove overly-permissive call_requests INSERT policy (edge function uses service role)
DROP POLICY IF EXISTS "Anyone can submit call requests" ON public.call_requests;
DROP POLICY IF EXISTS "Anyone can submit a call request" ON public.call_requests;
CREATE POLICY "Deny public insert access to call requests" ON public.call_requests
FOR INSERT WITH CHECK (false);