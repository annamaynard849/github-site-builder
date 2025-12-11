-- Remove orphaned loved_one_access records where the user no longer exists
DELETE FROM loved_one_access 
WHERE user_id NOT IN (SELECT id FROM auth.users);