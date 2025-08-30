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

-- Add constraint to prevent duplicate non-draft invoices per quote
CREATE OR REPLACE FUNCTION prevent_duplicate_invoices()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's already a non-draft invoice for this quote
    IF NOT NEW.is_draft AND EXISTS (
        SELECT 1 FROM invoices 
        WHERE quote_request_id = NEW.quote_request_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND NOT is_draft
    ) THEN
        RAISE EXCEPTION 'A finalized invoice already exists for this quote. Update the existing invoice instead.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the constraint
DROP TRIGGER IF EXISTS prevent_duplicate_invoices_trigger ON invoices;
CREATE TRIGGER prevent_duplicate_invoices_trigger
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_invoices();

-- Reset quote workflow statuses to proper progression
UPDATE quote_requests 
SET workflow_status = 'pending', 
    status = 'pending',
    last_status_change = now()
WHERE workflow_status IS NULL OR workflow_status NOT IN ('pending', 'under_review', 'estimated', 'sent', 'approved', 'completed', 'cancelled');

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