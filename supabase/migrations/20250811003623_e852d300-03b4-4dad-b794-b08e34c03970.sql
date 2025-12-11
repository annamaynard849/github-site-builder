-- Onboarding and Plans tables, plus task personalization columns

-- Create onboarding_answers table
CREATE TABLE IF NOT EXISTS public.onboarding_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loved_one_id UUID NOT NULL,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion_pct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_answers_user_loved_one_uniq UNIQUE (user_id, loved_one_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_answers ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own onboarding answers
CREATE POLICY IF NOT EXISTS "Users can manage their own onboarding answers"
ON public.onboarding_answers
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_onboarding_answers_updated_at ON public.onboarding_answers;
CREATE TRIGGER trg_onboarding_answers_updated_at
BEFORE UPDATE ON public.onboarding_answers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create plans table (one per loved one)
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loved_one_id UUID NOT NULL,
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT plans_loved_one_unique UNIQUE (loved_one_id)
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policies: Users with access to the loved one can read and write the plan
CREATE POLICY IF NOT EXISTS "Users can view plan for accessible loved ones"
ON public.plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = plans.loved_one_id
      AND (
        lo.admin_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM loved_one_access loa
          WHERE loa.loved_one_id = lo.id AND loa.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY IF NOT EXISTS "Users can upsert plan for accessible loved ones"
ON public.plans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = plans.loved_one_id
      AND (
        lo.admin_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM loved_one_access loa
          WHERE loa.loved_one_id = lo.id AND loa.user_id = auth.uid()
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = plans.loved_one_id
      AND (
        lo.admin_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM loved_one_access loa
          WHERE loa.loved_one_id = lo.id AND loa.user_id = auth.uid()
        )
      )
  )
);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_plans_updated_at ON public.plans;
CREATE TRIGGER trg_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add personalization fields to tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS task_key TEXT,
  ADD COLUMN IF NOT EXISTS is_personalized BOOLEAN NOT NULL DEFAULT false;

-- Helpful index for idempotent updates by key
CREATE INDEX IF NOT EXISTS idx_tasks_loved_one_task_key ON public.tasks (loved_one_id, task_key);
