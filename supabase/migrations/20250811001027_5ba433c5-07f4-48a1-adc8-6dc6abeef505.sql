-- 1) Prevent role escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Only admins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();

-- 2) Restrict get_profiles_for_users to only return team members for the loved one
CREATE OR REPLACE FUNCTION public.get_profiles_for_users(user_ids uuid[], loved_one_id uuid)
RETURNS TABLE(user_id uuid, first_name text, last_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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
  ),
  allowed_users AS (
    SELECT lo.admin_user_id AS user_id
    FROM loved_ones lo
    WHERE lo.id = loved_one_id
    UNION
    SELECT loa.user_id
    FROM loved_one_access loa
    WHERE loa.loved_one_id = loved_one_id
  )
  SELECT p.user_id, p.first_name, p.last_name, p.avatar_url
  FROM profiles p, requester r
  WHERE r.has_access = true
    AND p.user_id = ANY(user_ids)
    AND p.user_id IN (SELECT user_id FROM allowed_users);
$$;

-- 3) Invitations privacy: replace broad SELECT with secured RPC
DROP POLICY IF EXISTS "Users can view invitations by token for acceptance" ON public.support_team_invitations;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invitation_token uuid)
RETURNS SETOF public.support_team_invitations
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.support_team_invitations sti
  WHERE sti.invitation_token = get_invitation_by_token.invitation_token
    AND sti.status = 'pending'
    AND sti.expires_at > now()
  LIMIT 1;
$$;

-- 4) Memorial content moderation and validation triggers
CREATE OR REPLACE FUNCTION public.memorial_ensure_moderation_tributes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE owner_id uuid;
BEGIN
  SELECT lo.admin_user_id INTO owner_id
  FROM memorial_pages mp
  JOIN loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = NEW.memorial_page_id;

  IF auth.uid() IS NULL OR auth.uid() <> owner_id THEN
    NEW.is_approved := false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_memorial_ensure_moderation_tributes ON public.memorial_tributes;
CREATE TRIGGER trg_memorial_ensure_moderation_tributes
BEFORE INSERT ON public.memorial_tributes
FOR EACH ROW
EXECUTE FUNCTION public.memorial_ensure_moderation_tributes();

DROP TRIGGER IF EXISTS trg_validate_memorial_tributes ON public.memorial_tributes;
CREATE TRIGGER trg_validate_memorial_tributes
BEFORE INSERT OR UPDATE ON public.memorial_tributes
FOR EACH ROW
EXECUTE FUNCTION public.validate_memorial_content();

CREATE OR REPLACE FUNCTION public.memorial_ensure_moderation_memories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE owner_id uuid;
BEGIN
  SELECT lo.admin_user_id INTO owner_id
  FROM memorial_pages mp
  JOIN loved_ones lo ON lo.id = mp.loved_one_id
  WHERE mp.id = NEW.memorial_page_id;

  IF auth.uid() IS NULL OR auth.uid() <> owner_id THEN
    NEW.is_approved := false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_memorial_ensure_moderation_memories ON public.memorial_memories;
CREATE TRIGGER trg_memorial_ensure_moderation_memories
BEFORE INSERT ON public.memorial_memories
FOR EACH ROW
EXECUTE FUNCTION public.memorial_ensure_moderation_memories();

DROP TRIGGER IF EXISTS trg_validate_memorial_memories ON public.memorial_memories;
CREATE TRIGGER trg_validate_memorial_memories
BEFORE INSERT OR UPDATE ON public.memorial_memories
FOR EACH ROW
EXECUTE FUNCTION public.validate_memorial_content();

-- 5) Tighten security_logs INSERT policy to authenticated users
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;
CREATE POLICY "System can insert security logs"
ON public.security_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
