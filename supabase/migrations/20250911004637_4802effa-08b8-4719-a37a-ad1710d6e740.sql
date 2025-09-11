-- Streamline status management - remove redundant workflow_status fields
-- Keep only the main status field for simplicity

-- Update quote_requests to use single status field
UPDATE quote_requests SET status = workflow_status::text::quote_status WHERE workflow_status IS NOT NULL;

-- Update invoices to use single status field  
UPDATE invoices SET status = workflow_status::text WHERE workflow_status IS NOT NULL;

-- Add simplified status transitions for both tables
COMMENT ON COLUMN quote_requests.status IS 'Quote status: pending -> reviewed -> quoted -> confirmed -> completed -> cancelled';
COMMENT ON COLUMN invoices.status IS 'Invoice status: draft -> approved -> sent -> viewed -> paid -> overdue -> cancelled';