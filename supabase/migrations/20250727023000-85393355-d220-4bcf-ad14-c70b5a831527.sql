-- Remove invitation records where the accepted user no longer exists in auth.users
DELETE FROM support_team_invitations 
WHERE accepted_by_user_id IS NOT NULL 
AND accepted_by_user_id NOT IN (SELECT id FROM auth.users);