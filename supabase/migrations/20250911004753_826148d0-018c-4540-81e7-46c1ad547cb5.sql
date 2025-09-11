-- Fix invalid enum values by updating them to valid statuses first
UPDATE quote_requests SET workflow_status = 'quoted' WHERE workflow_status = 'estimated';
UPDATE invoices SET workflow_status = 'draft' WHERE workflow_status = 'estimated';

-- Now sync the status fields 
UPDATE quote_requests SET status = workflow_status::text::quote_status WHERE workflow_status IS NOT NULL;
UPDATE invoices SET status = workflow_status::text WHERE workflow_status IS NOT NULL;