-- Fix the remaining function with search path
CREATE OR REPLACE FUNCTION log_invoice_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'status', to_jsonb(OLD.status), to_jsonb(NEW.status), NEW.status_changed_by);
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;