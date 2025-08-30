-- Simple data cleanup - remove duplicate invoices only
WITH duplicate_invoices AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY quote_request_id 
           ORDER BY created_at DESC, updated_at DESC
         ) as row_num
  FROM invoices 
  WHERE quote_request_id IS NOT NULL
)
DELETE FROM invoices 
WHERE id IN (
  SELECT id FROM duplicate_invoices WHERE row_num > 1
);

-- Reset NULL workflow statuses to default values
UPDATE quote_requests 
SET workflow_status = 'pending'::quote_workflow_status
WHERE workflow_status IS NULL;

UPDATE invoices 
SET workflow_status = 'draft'::invoice_workflow_status
WHERE workflow_status IS NULL;