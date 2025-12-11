-- Drop existing foreign key constraints that point to profiles table
ALTER TABLE loved_one_access DROP CONSTRAINT IF EXISTS loved_one_access_user_id_fkey;
ALTER TABLE loved_one_access DROP CONSTRAINT IF EXISTS loved_one_access_granted_by_fkey;

-- Add new foreign key constraints that point directly to auth.users
ALTER TABLE loved_one_access 
ADD CONSTRAINT loved_one_access_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE loved_one_access 
ADD CONSTRAINT loved_one_access_granted_by_fkey 
FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE;