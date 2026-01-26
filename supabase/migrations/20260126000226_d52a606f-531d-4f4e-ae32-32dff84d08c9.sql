-- Add military_organization column to quote_requests
ALTER TABLE quote_requests 
ADD COLUMN military_organization TEXT;

COMMENT ON COLUMN quote_requests.military_organization IS 
  'Military unit name (squadron, group, battalion, etc.) for military_function events';