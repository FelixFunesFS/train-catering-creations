-- Phase 3: Persistent Customer Portal
-- Extend token expiry to 1 year for permanent customer access

-- Update the default token expiry from 90 days to 1 year
ALTER TABLE invoices 
ALTER COLUMN token_expires_at 
SET DEFAULT (now() + interval '1 year');

-- Extend existing tokens to 1 year from now
UPDATE invoices 
SET token_expires_at = (now() + interval '1 year')
WHERE token_expires_at IS NOT NULL 
  AND token_expires_at < (now() + interval '1 year')
  AND document_type = 'estimate';

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_invoices_customer_access_token 
ON invoices(customer_access_token) 
WHERE customer_access_token IS NOT NULL;

-- Add index for token expiry checks
CREATE INDEX IF NOT EXISTS idx_invoices_token_expires_at 
ON invoices(token_expires_at) 
WHERE token_expires_at IS NOT NULL;