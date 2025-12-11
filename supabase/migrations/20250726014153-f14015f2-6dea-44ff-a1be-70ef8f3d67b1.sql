-- Add unique constraint to ensure one loved one per user
ALTER TABLE public.loved_ones 
ADD CONSTRAINT unique_admin_user_loved_one 
UNIQUE (admin_user_id);

-- Add a comment to document this constraint
COMMENT ON CONSTRAINT unique_admin_user_loved_one ON public.loved_ones 
IS 'Ensures each user can only be the admin of one loved one';