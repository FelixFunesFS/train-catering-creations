-- Add wedding-specific columns to quote_requests table
ALTER TABLE quote_requests
ADD COLUMN ceremony_included boolean DEFAULT false,
ADD COLUMN cocktail_hour boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN quote_requests.ceremony_included IS 'Whether catering service is needed during the wedding ceremony';
COMMENT ON COLUMN quote_requests.cocktail_hour IS 'Whether a cocktail hour service is included in the wedding package';