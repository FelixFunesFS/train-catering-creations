-- Fix the log_invoice_changes function to stop referencing OLD.status

DROP FUNCTION IF EXISTS public.log_invoice_changes() CASCADE;

CREATE OR REPLACE FUNCTION public.log_invoice_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log workflow_status changes (not status which doesn't exist)
  IF OLD.workflow_status IS DISTINCT FROM NEW.workflow_status THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'workflow_status', to_jsonb(OLD.workflow_status), to_jsonb(NEW.workflow_status), NEW.status_changed_by);
  END IF;
  
  -- Log total amount changes
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'total_amount', to_jsonb(OLD.total_amount), to_jsonb(NEW.total_amount), NEW.status_changed_by);
  END IF;
  
  -- Log document type changes
  IF OLD.document_type IS DISTINCT FROM NEW.document_type THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'document_type', to_jsonb(OLD.document_type), to_jsonb(NEW.document_type), NEW.status_changed_by);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger (CASCADE will have dropped it)
CREATE TRIGGER track_invoice_changes_trigger
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_changes();