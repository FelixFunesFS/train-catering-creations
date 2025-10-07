-- Workflow Status Synchronization Trigger (Fixed)
-- Automatically keeps quote_requests.workflow_status in sync with invoices.workflow_status

CREATE OR REPLACE FUNCTION sync_invoice_to_quote_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mapped_quote_status quote_workflow_status;
BEGIN
  -- Only sync if quote_request_id exists
  IF NEW.quote_request_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Map invoice workflow statuses to quote statuses
  mapped_quote_status := CASE NEW.workflow_status
    WHEN 'draft' THEN 'pending'::quote_workflow_status
    WHEN 'pending_review' THEN 'under_review'::quote_workflow_status
    WHEN 'sent' THEN 'estimated'::quote_workflow_status
    WHEN 'viewed' THEN 'estimated'::quote_workflow_status
    WHEN 'approved' THEN 'approved'::quote_workflow_status
    WHEN 'payment_pending' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'partially_paid' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'paid' THEN 'paid'::quote_workflow_status
    WHEN 'overdue' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'cancelled' THEN 'cancelled'::quote_workflow_status
    ELSE 'pending'::quote_workflow_status
  END;

  -- Update the quote's workflow_status
  UPDATE quote_requests
  SET 
    workflow_status = mapped_quote_status,
    last_status_change = now(),
    updated_at = now()
  WHERE id = NEW.quote_request_id;

  RETURN NEW;
END;
$$;

-- Create trigger that fires after invoice workflow_status updates
DROP TRIGGER IF EXISTS trigger_sync_invoice_to_quote_status ON invoices;

CREATE TRIGGER trigger_sync_invoice_to_quote_status
  AFTER INSERT OR UPDATE OF workflow_status
  ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_invoice_to_quote_status();

-- Add comment for documentation
COMMENT ON FUNCTION sync_invoice_to_quote_status() IS 
'Automatically synchronizes quote_requests.workflow_status when invoices.workflow_status changes. Part of the unified workflow system.';