-- Drop the broken trigger that references OLD.status
DROP TRIGGER IF EXISTS update_invoice_status_trigger ON invoices;

-- Drop the broken function
DROP FUNCTION IF EXISTS public.update_invoice_status();

-- Create new function that correctly uses workflow_status
CREATE OR REPLACE FUNCTION public.log_invoice_workflow_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When workflow_status changes, update timestamp and log
  IF OLD.workflow_status IS DISTINCT FROM NEW.workflow_status THEN
    NEW.last_status_change = now();
    
    -- Log the change to workflow_state_log table
    INSERT INTO workflow_state_log (
      entity_type,
      entity_id,
      previous_status,
      new_status,
      changed_by,
      change_reason
    ) VALUES (
      'invoices',
      NEW.id,
      OLD.workflow_status::text,
      NEW.workflow_status::text,
      COALESCE(NEW.status_changed_by, 'system'),
      'Workflow status updated'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create new trigger using the corrected function
CREATE TRIGGER log_invoice_workflow_changes_trigger
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_workflow_changes();