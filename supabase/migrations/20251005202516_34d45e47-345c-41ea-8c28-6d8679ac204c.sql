-- Remove tables_chairs_requested and linens_requested columns
-- These services are NOT offered by Soul Train's Eatery

ALTER TABLE quote_requests 
DROP COLUMN IF EXISTS tables_chairs_requested,
DROP COLUMN IF EXISTS linens_requested;

COMMENT ON TABLE quote_requests IS 'Updated schema - removed tables_chairs and linens (not offered by Soul Train''s Eatery)';