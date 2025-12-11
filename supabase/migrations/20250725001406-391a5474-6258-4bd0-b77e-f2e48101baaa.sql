-- Fix critical role-based access control vulnerability
-- Create a security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the existing permissive update policy on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create restrictive policies that prevent role escalation
CREATE POLICY "Users can update their profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent users from changing their own role
  (OLD.role IS NOT DISTINCT FROM NEW.role OR public.get_current_user_role() = 'admin')
);

-- Create admin-only policy for role management
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Add input validation constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT check_first_name_length CHECK (char_length(first_name) <= 100),
ADD CONSTRAINT check_last_name_length CHECK (char_length(last_name) <= 100),
ADD CONSTRAINT check_role_valid CHECK (role IN ('user', 'admin', 'moderator'));

ALTER TABLE public.loved_ones 
ADD CONSTRAINT check_first_name_length CHECK (char_length(first_name) <= 100),
ADD CONSTRAINT check_last_name_length CHECK (char_length(last_name) <= 100),
ADD CONSTRAINT check_obituary_length CHECK (char_length(obituary) <= 10000);

ALTER TABLE public.tasks
ADD CONSTRAINT check_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT check_description_length CHECK (char_length(description) <= 5000),
ADD CONSTRAINT check_category_length CHECK (char_length(category) <= 100),
ADD CONSTRAINT check_status_valid CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
ADD CONSTRAINT check_priority_valid CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add audit logging function
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes for security auditing
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO auth.audit_log_entries (
      instance_id,
      id,
      payload,
      created_at,
      ip_address
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      json_build_object(
        'event', 'role_changed',
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      ),
      now(),
      inet_client_addr()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile changes
CREATE TRIGGER profile_changes_audit
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();

-- Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only admins can update user roles';
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('user', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update the role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;