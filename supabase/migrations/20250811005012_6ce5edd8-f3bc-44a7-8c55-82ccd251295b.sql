-- Update unique constraint for loved_ones
ALTER TABLE public.loved_ones
  DROP CONSTRAINT IF EXISTS unique_admin_user_loved_one;

-- Create new composite uniqueness for identity per admin
ALTER TABLE public.loved_ones
  ADD CONSTRAINT unique_admin_user_loved_one_identity
  UNIQUE (admin_user_id, first_name, last_name, date_of_birth, date_of_death);
