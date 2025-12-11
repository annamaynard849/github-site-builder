-- Add custom task support columns
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by_user_id uuid;

-- Add a foreign key to profiles.user_id for created_by_user_id (on delete set null)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tasks_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id)
    REFERENCES public.profiles(user_id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- No change to RLS policies needed for admins/family members since existing policies grant ALL.
-- If later we need support members to create tasks, we can add a dedicated INSERT policy.
