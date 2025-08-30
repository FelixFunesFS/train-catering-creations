-- Phase 2: Data Model Cleanup - Remove duplicate invoices and reset workflow states

-- First, identify and delete duplicate invoices (keep only the latest one per quote)
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

-- Reset quote workflow statuses to proper progression (using correct enum values)
UPDATE quote_requests 
SET workflow_status = 'pending'::quote_workflow_status, 
    status = 'pending'::quote_status,
    last_status_change = now()
WHERE workflow_status IS NULL OR workflow_status NOT IN ('pending', 'under_review', 'estimated', 'awaiting_approval', 'approved', 'completed', 'cancelled');

-- Reset invoice workflow statuses
UPDATE invoices 
SET workflow_status = CASE 
    WHEN is_draft THEN 'draft'::invoice_workflow_status
    WHEN sent_at IS NOT NULL THEN 'sent'::invoice_workflow_status
    WHEN paid_at IS NOT NULL THEN 'paid'::invoice_workflow_status
    ELSE 'draft'::invoice_workflow_status
END,
last_status_change = now()
WHERE workflow_status IS NULL;