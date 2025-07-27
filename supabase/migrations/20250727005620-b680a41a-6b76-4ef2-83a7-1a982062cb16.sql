-- Force schema refresh by adding a comment to trigger type regeneration
COMMENT ON TABLE quote_requests IS 'Table for storing quote requests with updated enum types';