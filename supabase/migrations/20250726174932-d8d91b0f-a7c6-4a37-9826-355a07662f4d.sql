-- Fix function search path security issue
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Apply content validation triggers
CREATE TRIGGER validate_memorial_memories_content
  BEFORE INSERT OR UPDATE ON memorial_memories
  FOR EACH ROW EXECUTE FUNCTION validate_memorial_content();

CREATE TRIGGER validate_memorial_tributes_content
  BEFORE INSERT OR UPDATE ON memorial_tributes
  FOR EACH ROW EXECUTE FUNCTION validate_memorial_content();