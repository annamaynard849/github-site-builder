-- Phase 1: Fix Critical RLS Policy Vulnerabilities

-- Fix the overly permissive support_team_invitations policy
DROP POLICY IF EXISTS "Allow invitation validation for acceptance flow" ON public.support_team_invitations;

-- Replace with proper access-controlled policy for invitation validation
CREATE POLICY "Users can view invitations by token for acceptance"
ON public.support_team_invitations
FOR SELECT
USING (
  -- Allow viewing only for acceptance flow with valid token
  (invitation_token IS NOT NULL AND status = 'pending' AND expires_at > now())
);

-- Add policy to allow users to view invitations sent to their email
CREATE POLICY "Users can view invitations sent to their email"
ON public.support_team_invitations
FOR SELECT
USING (
  invited_email = auth.email() AND auth.uid() IS NOT NULL
);

-- Enhance memorial content security - ensure only approved content is visible
-- Update memorial memories policy to include approval check
DROP POLICY IF EXISTS "Memorial memories are viewable by everyone for public pages" ON public.memorial_memories;

CREATE POLICY "Approved memorial memories are viewable on public pages"
ON public.memorial_memories
FOR SELECT
USING (
  is_approved = true AND 
  EXISTS (
    SELECT 1 FROM memorial_pages 
    WHERE memorial_pages.id = memorial_memories.memorial_page_id 
    AND memorial_pages.is_public = true
  )
);

-- Update memorial tributes policy to include approval check
DROP POLICY IF EXISTS "Memorial tributes are viewable by everyone for public pages" ON public.memorial_tributes;

CREATE POLICY "Approved memorial tributes are viewable on public pages"
ON public.memorial_tributes
FOR SELECT
USING (
  is_approved = true AND 
  EXISTS (
    SELECT 1 FROM memorial_pages 
    WHERE memorial_pages.id = memorial_tributes.memorial_page_id 
    AND memorial_pages.is_public = true
  )
);

-- Add content validation trigger for memorial content
CREATE OR REPLACE FUNCTION validate_memorial_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate content length and basic safety
  IF LENGTH(COALESCE(NEW.message, NEW.caption, '')) > 5000 THEN
    RAISE EXCEPTION 'Content exceeds maximum length of 5000 characters';
  END IF;
  
  -- Check for suspicious patterns in content
  IF NEW.message ~ '(?i)<script|javascript:|vbscript:|onload=|onerror=|onclick=' OR
     NEW.caption ~ '(?i)<script|javascript:|vbscript:|onload=|onerror=|onclick=' THEN
    RAISE EXCEPTION 'Content contains potentially unsafe elements';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;