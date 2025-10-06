-- Phase 1: Consolidate Status Fields - Remove status column chaos (Final Fix)

-- Step 1: Drop ALL triggers that might reference status columns
DROP TRIGGER IF EXISTS sync_workflow_status_quotes ON quote_requests CASCADE;
DROP TRIGGER IF EXISTS sync_workflow_status_invoices ON invoices CASCADE;
DROP TRIGGER IF EXISTS update_invoice_status_trigger ON invoices CASCADE;
DROP TRIGGER IF EXISTS update_quote_request_status_trigger ON quote_requests CASCADE;
DROP TRIGGER IF EXISTS update_quote_workflow_status ON quote_requests CASCADE;
DROP TRIGGER IF EXISTS update_invoice_workflow_status ON invoices CASCADE;
DROP TRIGGER IF EXISTS trigger_update_quote_request_status ON quote_requests CASCADE;
DROP TRIGGER IF EXISTS trigger_update_invoice_status ON invoices CASCADE;

-- Step 2: Drop the sync functions
DROP FUNCTION IF EXISTS public.sync_workflow_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_quote_request_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_quote_workflow_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_workflow_status() CASCADE;

-- Step 3: Migrate any existing status data to workflow_status before dropping column
-- For quote_requests
UPDATE quote_requests 
SET workflow_status = CASE 
  WHEN status = 'pending' THEN 'pending'::quote_workflow_status
  WHEN status = 'reviewed' THEN 'under_review'::quote_workflow_status
  WHEN status = 'quoted' THEN 'estimated'::quote_workflow_status
  WHEN status = 'confirmed' THEN 'confirmed'::quote_workflow_status
  WHEN status = 'completed' THEN 'completed'::quote_workflow_status
  WHEN status = 'cancelled' THEN 'cancelled'::quote_workflow_status
  ELSE workflow_status
END
WHERE workflow_status IS NULL OR workflow_status::text != status::text;

-- For invoices
UPDATE invoices 
SET workflow_status = CASE 
  WHEN status = 'draft' THEN 'draft'::invoice_workflow_status
  WHEN status = 'approved' THEN 'approved'::invoice_workflow_status
  WHEN status = 'sent' THEN 'sent'::invoice_workflow_status
  WHEN status = 'viewed' THEN 'viewed'::invoice_workflow_status
  WHEN status = 'paid' THEN 'paid'::invoice_workflow_status
  WHEN status = 'overdue' THEN 'overdue'::invoice_workflow_status
  WHEN status = 'cancelled' THEN 'cancelled'::invoice_workflow_status
  WHEN status = 'change_requested' THEN 'pending_review'::invoice_workflow_status
  ELSE workflow_status
END
WHERE workflow_status IS NULL OR workflow_status::text != status;

-- Step 4: Drop the old status columns with CASCADE
ALTER TABLE quote_requests DROP COLUMN IF EXISTS status CASCADE;
ALTER TABLE invoices DROP COLUMN IF EXISTS status CASCADE;

-- Step 5: Make workflow_status NOT NULL (it's the only status now)
ALTER TABLE quote_requests ALTER COLUMN workflow_status SET NOT NULL;
ALTER TABLE quote_requests ALTER COLUMN workflow_status SET DEFAULT 'pending'::quote_workflow_status;

ALTER TABLE invoices ALTER COLUMN workflow_status SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN workflow_status SET DEFAULT 'draft'::invoice_workflow_status;

-- Step 6: Create a simple trigger to update last_status_change timestamp
CREATE OR REPLACE FUNCTION update_status_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.workflow_status IS DISTINCT FROM NEW.workflow_status THEN
    NEW.last_status_change = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quote_status_timestamp
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_status_timestamp();

CREATE TRIGGER invoice_status_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_status_timestamp();

-- Step 7: Add comments for clarity
COMMENT ON COLUMN quote_requests.workflow_status IS 'Single source of truth for quote workflow state';
COMMENT ON COLUMN invoices.workflow_status IS 'Single source of truth for invoice workflow state';