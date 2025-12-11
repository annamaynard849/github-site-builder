-- Critical Security Fixes for Data Privacy (Fixed)

-- 1. Enhance memorial memories privacy - add content moderation for personal info
CREATE OR REPLACE FUNCTION public.validate_memorial_content_privacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check for potentially sensitive personal information patterns
  IF NEW.message ~ '(?i)(ssn|social security|phone|address|credit card|bank account|\d{3}-\d{2}-\d{4}|\d{10,}|\d{4}-\d{4}-\d{4}-\d{4})' OR
     NEW.caption ~ '(?i)(ssn|social security|phone|address|credit card|bank account|\d{3}-\d{2}-\d{4}|\d{10,}|\d{4}-\d{4}-\d{4}-\d{4})' THEN
    -- Log potential PII exposure
    INSERT INTO public.security_logs (event_type, user_id, details)
    VALUES (
      'potential_pii_detected',
      auth.uid(),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'memorial_page_id', NEW.memorial_page_id,
        'content_length', LENGTH(COALESCE(NEW.message, NEW.caption, '')),
        'timestamp', now()
      )
    );
    
    -- Require manual approval for content with potential PII
    NEW.is_approved := false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply privacy validation to memorial memories
DROP TRIGGER IF EXISTS validate_memorial_memories_privacy ON public.memorial_memories;
CREATE TRIGGER validate_memorial_memories_privacy
  BEFORE INSERT OR UPDATE ON public.memorial_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_memorial_content_privacy();

-- Apply privacy validation to memorial tributes  
DROP TRIGGER IF EXISTS validate_memorial_tributes_privacy ON public.memorial_tributes;
CREATE TRIGGER validate_memorial_tributes_privacy
  BEFORE INSERT OR UPDATE ON public.memorial_tributes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_memorial_content_privacy();

-- 2. Enhanced logging for sensitive memorial operations
CREATE OR REPLACE FUNCTION public.log_memorial_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to memorial content that might contain personal information
  INSERT INTO public.security_logs (event_type, user_id, details)
  VALUES (
    'memorial_content_accessed',
    auth.uid(),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'memorial_page_id', COALESCE(NEW.memorial_page_id, OLD.memorial_page_id),
      'operation', TG_OP,
      'ip_address', current_setting('request.headers', true)::json->>'x-real-ip',
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply logging to sensitive memorial tables
DROP TRIGGER IF EXISTS log_memorial_memories_access ON public.memorial_memories;
CREATE TRIGGER log_memorial_memories_access
  AFTER INSERT OR UPDATE OR DELETE ON public.memorial_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.log_memorial_access();

DROP TRIGGER IF EXISTS log_memorial_tributes_access ON public.memorial_tributes;
CREATE TRIGGER log_memorial_tributes_access
  AFTER INSERT OR UPDATE OR DELETE ON public.memorial_tributes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_memorial_access();

-- 3. Add function to check memorial access permissions
CREATE OR REPLACE FUNCTION public.user_can_access_memorial_details(_memorial_page_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE mp.id = _memorial_page_id
    AND (
      -- Owner can always see details
      lo.admin_user_id = _user_id
      -- Family members can see family-only and private pages
      OR (mp.privacy_level IN ('family_only', 'public') AND EXISTS (
        SELECT 1 FROM loved_one_access loa 
        WHERE loa.loved_one_id = lo.id 
        AND loa.user_id = _user_id 
        AND loa.role = 'family_member'
      ))
      -- Public pages are viewable by all but with limited personal details
      OR (mp.privacy_level = 'public' AND mp.is_public = true)
    )
  );
$$;

-- 4. Create security audit function for memorial pages
CREATE OR REPLACE FUNCTION public.audit_memorial_security(_memorial_page_id uuid DEFAULT NULL)
RETURNS TABLE(
  memorial_page_id uuid,
  privacy_level text,
  potential_issues text[],
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  page_record record;
  issues text[] := '{}';
  rec text;
BEGIN
  FOR page_record IN 
    SELECT mp.id, mp.privacy_level, mp.is_public, lo.admin_user_id
    FROM memorial_pages mp
    JOIN loved_ones lo ON lo.id = mp.loved_one_id
    WHERE (_memorial_page_id IS NULL OR mp.id = _memorial_page_id)
    AND (lo.admin_user_id = auth.uid() OR public.get_current_user_role() = 'admin')
  LOOP
    issues := '{}';
    
    -- Check for public pages with potential privacy risks
    IF page_record.privacy_level = 'public' AND page_record.is_public THEN
      -- Check for tributes with potential PII
      IF EXISTS (
        SELECT 1 FROM memorial_tributes mt 
        WHERE mt.memorial_page_id = page_record.id 
        AND mt.message ~ '(?i)(phone|address|email|@|\d{3}-\d{2}-\d{4}|\d{10,})'
      ) THEN
        issues := array_append(issues, 'Tributes may contain personal information');
      END IF;
      
      -- Check for memories with potential PII
      IF EXISTS (
        SELECT 1 FROM memorial_memories mm 
        WHERE mm.memorial_page_id = page_record.id 
        AND mm.caption ~ '(?i)(phone|address|email|@|\d{3}-\d{2}-\d{4}|\d{10,})'
      ) THEN
        issues := array_append(issues, 'Memory captions may contain personal information');
      END IF;
    END IF;
    
    -- Generate recommendation
    rec := CASE 
      WHEN array_length(issues, 1) > 0 THEN 'Review content for personal information and consider restricting privacy level'
      ELSE 'No immediate privacy concerns detected'
    END;
    
    RETURN QUERY SELECT page_record.id, page_record.privacy_level, issues, rec;
  END LOOP;
END;
$$;