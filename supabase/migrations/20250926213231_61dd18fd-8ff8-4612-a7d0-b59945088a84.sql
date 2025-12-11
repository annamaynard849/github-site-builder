-- Critical Security Fixes: Role-Based Access Control and RLS Improvements

-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 4. Create function to get user's highest role (admin > moderator > user)
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role 
     FROM public.user_roles 
     WHERE user_id = _user_id 
     ORDER BY 
       CASE role
         WHEN 'admin' THEN 1
         WHEN 'moderator' THEN 2  
         WHEN 'user' THEN 3
       END
     LIMIT 1),
    'user'::app_role
  );
$$;

-- 5. Update get_current_user_role function to use new system
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_highest_role(auth.uid())::text;
$$;

-- 6. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Migrate existing profile roles to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'moderator' THEN 'moderator'::app_role
    ELSE 'user'::app_role
  END
FROM public.profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Add trigger to prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation_new()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can grant admin or moderator roles
  IF NEW.role IN ('admin', 'moderator') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can grant admin or moderator roles';
    END IF;
  END IF;
  
  -- Set granted_by
  NEW.granted_by = auth.uid();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation_new();

-- 9. Update profiles table to remove role dependency (keep for backward compatibility but deprecate)
-- We'll keep the role column but it will no longer be the source of truth

-- 10. Enhanced memorial page security - Add privacy levels
ALTER TABLE public.memorial_pages 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'family_only', 'private'));

-- 11. Update memorial page RLS policies for better security
DROP POLICY IF EXISTS "Memorial pages are viewable by everyone" ON public.memorial_pages;

CREATE POLICY "Public memorial pages are viewable by everyone"
ON public.memorial_pages
FOR SELECT
USING (privacy_level = 'public' AND is_public = true);

CREATE POLICY "Family-only memorial pages viewable by family members"
ON public.memorial_pages  
FOR SELECT
USING (
  privacy_level = 'family_only' 
  AND (
    EXISTS (
      SELECT 1 FROM loved_ones lo 
      WHERE lo.id = memorial_pages.loved_one_id 
      AND lo.admin_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM loved_ones lo 
      JOIN loved_one_access loa ON loa.loved_one_id = lo.id
      WHERE lo.id = memorial_pages.loved_one_id 
      AND loa.user_id = auth.uid()
      AND loa.role = 'family_member'
    )
  )
);

CREATE POLICY "Private memorial pages viewable by owners only"
ON public.memorial_pages
FOR SELECT  
USING (
  privacy_level = 'private'
  AND EXISTS (
    SELECT 1 FROM loved_ones lo
    WHERE lo.id = memorial_pages.loved_one_id 
    AND lo.admin_user_id = auth.uid()
  )
);

-- 12. Add content validation trigger for memorial content
CREATE OR REPLACE FUNCTION public.validate_memorial_content_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate content length
  IF LENGTH(COALESCE(NEW.message, NEW.caption, NEW.quote_text, '')) > 5000 THEN
    RAISE EXCEPTION 'Content exceeds maximum length of 5000 characters';
  END IF;
  
  -- Check for suspicious patterns (enhanced)
  IF NEW.message ~ '(?i)<script|javascript:|vbscript:|onload=|onerror=|onclick=|data:text/html|<iframe|<object|<embed' OR
     NEW.caption ~ '(?i)<script|javascript:|vbscript:|onload=|onerror=|onclick=|data:text/html|<iframe|<object|<embed' OR
     NEW.quote_text ~ '(?i)<script|javascript:|vbscript:|onload=|onerror=|onclick=|data:text/html|<iframe|<object|<embed' THEN
    RAISE EXCEPTION 'Content contains potentially unsafe elements';
  END IF;
  
  -- Log content creation for audit
  INSERT INTO public.security_logs (event_type, user_id, details)
  VALUES (
    'memorial_content_created',
    auth.uid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'content_length', LENGTH(COALESCE(NEW.message, NEW.caption, NEW.quote_text, '')),
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Apply enhanced validation to memorial content tables
DROP TRIGGER IF EXISTS validate_memorial_content_trigger ON public.memorial_tributes;
CREATE TRIGGER validate_memorial_content_trigger
  BEFORE INSERT OR UPDATE ON public.memorial_tributes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_memorial_content_enhanced();

DROP TRIGGER IF EXISTS validate_memorial_memories_trigger ON public.memorial_memories;  
CREATE TRIGGER validate_memorial_memories_trigger
  BEFORE INSERT OR UPDATE ON public.memorial_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_memorial_content_enhanced();

DROP TRIGGER IF EXISTS validate_memorial_quotes_trigger ON public.memorial_quotes;
CREATE TRIGGER validate_memorial_quotes_trigger
  BEFORE INSERT OR UPDATE ON public.memorial_quotes
  FOR EACH ROW  
  EXECUTE FUNCTION public.validate_memorial_content_enhanced();