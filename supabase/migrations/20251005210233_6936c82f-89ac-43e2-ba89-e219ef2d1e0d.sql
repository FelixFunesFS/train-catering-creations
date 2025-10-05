-- Drop existing trigger
DROP TRIGGER IF EXISTS update_invoice_status_trigger ON invoices;

-- Replace the function with updated mapping to handle 'change_requested'
CREATE OR REPLACE FUNCTION public.update_invoice_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When status changes, update workflow_status and timestamp
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change = now();
    
    -- Map status to workflow_status correctly using text
    CASE 
      WHEN NEW.status = 'draft' THEN 
        NEW.workflow_status = 'draft';
      WHEN NEW.status = 'approved' THEN 
        NEW.workflow_status = 'approved';
      WHEN NEW.status = 'sent' THEN 
        NEW.workflow_status = 'sent';
      WHEN NEW.status = 'viewed' THEN 
        NEW.workflow_status = 'viewed';
      WHEN NEW.status = 'paid' THEN 
        NEW.workflow_status = 'paid';
      WHEN NEW.status = 'overdue' THEN 
        NEW.workflow_status = 'overdue';
      WHEN NEW.status = 'cancelled' THEN 
        NEW.workflow_status = 'cancelled';
      -- Map change_requested to pending_review (workflow_status enum doesn't have change_requested)
      WHEN NEW.status = 'change_requested' THEN
        NEW.workflow_status = 'pending_review';
      ELSE 
        -- Keep existing workflow_status if no mapping exists
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER update_invoice_status_trigger
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- Fix existing invoices with change_requested status
UPDATE invoices 
SET updated_at = now()
WHERE status = 'change_requested' AND workflow_status != 'pending_review';