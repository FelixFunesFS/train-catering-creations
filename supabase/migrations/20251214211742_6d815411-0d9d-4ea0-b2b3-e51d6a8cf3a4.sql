-- Add change tracking columns to quote_request_history
ALTER TABLE quote_request_history 
ADD COLUMN IF NOT EXISTS change_source text 
CHECK (change_source IN ('phone', 'email', 'portal_change_request', 'in_person', 'admin_adjustment'));

ALTER TABLE quote_request_history 
ADD COLUMN IF NOT EXISTS contact_info text;

ALTER TABLE quote_request_history 
ADD COLUMN IF NOT EXISTS customer_summary text;