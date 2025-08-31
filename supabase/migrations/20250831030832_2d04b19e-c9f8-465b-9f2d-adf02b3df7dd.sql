-- Add token-based customer access for estimates
ALTER TABLE invoices ADD COLUMN customer_access_token UUID DEFAULT gen_random_uuid();

-- Index for faster token lookups
CREATE INDEX idx_invoices_access_token ON invoices(customer_access_token);

-- Update existing invoices to have tokens
UPDATE invoices SET customer_access_token = gen_random_uuid() WHERE customer_access_token IS NULL;