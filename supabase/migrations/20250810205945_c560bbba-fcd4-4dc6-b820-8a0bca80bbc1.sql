-- Create a SECURITY DEFINER function to fetch profile names for specific users
-- Only return data when the requester has access to the loved one
CREATE OR REPLACE FUNCTION public.get_profiles_for_users(user_ids uuid[], loved_one_id uuid)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH requester AS (
    SELECT true AS has_access
    FROM loved_ones lo
    WHERE lo.id = loved_one_id
      AND (
        lo.admin_user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM loved_one_access loa
          WHERE loa.loved_one_id = lo.id
            AND loa.user_id = auth.uid()
        )
      )
  )
  SELECT p.user_id, p.first_name, p.last_name, p.avatar_url
  FROM profiles p, requester r
  WHERE r.has_access = true
    AND p.user_id = ANY(user_ids);
$$;

-- Ensure authenticated users can execute the function
GRANT EXECUTE ON FUNCTION public.get_profiles_for_users(uuid[], uuid) TO authenticated;