-- Fix function search path security issue
-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.sync_workflow_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- For quote_requests table - only sync valid statuses
  IF TG_TABLE_NAME = 'quote_requests' THEN
    CASE 
      WHEN NEW.status = 'pending' THEN NEW.workflow_status = 'pending'::quote_workflow_status;
      WHEN NEW.status = 'reviewed' THEN NEW.workflow_status = 'under_review'::quote_workflow_status;
      WHEN NEW.status = 'quoted' THEN NEW.workflow_status = 'quoted'::quote_workflow_status;
      WHEN NEW.status = 'confirmed' THEN NEW.workflow_status = 'confirmed'::quote_workflow_status;
      WHEN NEW.status = 'completed' THEN NEW.workflow_status = 'completed'::quote_workflow_status;
      WHEN NEW.status = 'cancelled' THEN NEW.workflow_status = 'cancelled'::quote_workflow_status;
      ELSE -- Keep existing workflow_status if no mapping exists
    END CASE;
  END IF;
  
  -- For invoices table - only sync valid statuses
  IF TG_TABLE_NAME = 'invoices' THEN
    CASE 
      WHEN NEW.status = 'draft' THEN NEW.workflow_status = 'draft'::invoice_workflow_status;
      WHEN NEW.status = 'approved' THEN NEW.workflow_status = 'approved'::invoice_workflow_status;
      WHEN NEW.status = 'sent' THEN NEW.workflow_status = 'sent'::invoice_workflow_status;
      WHEN NEW.status = 'viewed' THEN NEW.workflow_status = 'viewed'::invoice_workflow_status;
      WHEN NEW.status = 'paid' THEN NEW.workflow_status = 'paid'::invoice_workflow_status;
      WHEN NEW.status = 'overdue' THEN NEW.workflow_status = 'overdue'::invoice_workflow_status;
      WHEN NEW.status = 'cancelled' THEN NEW.workflow_status = 'cancelled'::invoice_workflow_status;
      ELSE -- Keep existing workflow_status if no mapping exists
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_quote_request_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Only log if this is an UPDATE operation
  IF TG_OP = 'UPDATE' THEN
    -- Check each field for changes and log them
    IF OLD.contact_name IS DISTINCT FROM NEW.contact_name THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'contact_name', OLD.contact_name, NEW.contact_name, 'admin');
    END IF;
    
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'email', OLD.email, NEW.email, 'admin');
    END IF;
    
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'phone', OLD.phone, NEW.phone, 'admin');
    END IF;
    
    IF OLD.event_name IS DISTINCT FROM NEW.event_name THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'event_name', OLD.event_name, NEW.event_name, 'admin');
    END IF;
    
    IF OLD.event_date IS DISTINCT FROM NEW.event_date THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'event_date', OLD.event_date::TEXT, NEW.event_date::TEXT, 'admin');
    END IF;
    
    IF OLD.guest_count IS DISTINCT FROM NEW.guest_count THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'guest_count', OLD.guest_count::TEXT, NEW.guest_count::TEXT, 'admin');
    END IF;
    
    IF OLD.location IS DISTINCT FROM NEW.location THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'location', OLD.location, NEW.location, 'admin');
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'status', OLD.status::TEXT, NEW.status::TEXT, 'admin');
    END IF;
    
    IF OLD.service_type IS DISTINCT FROM NEW.service_type THEN
      INSERT INTO public.quote_request_history (quote_request_id, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'service_type', OLD.service_type::TEXT, NEW.service_type::TEXT, 'admin');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_thread_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.message_threads 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_duplicate_invoices()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if there's already a non-draft invoice for this quote
    IF EXISTS (
        SELECT 1 FROM invoices 
        WHERE quote_request_id = NEW.quote_request_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND NOT is_draft
    ) THEN
        RAISE EXCEPTION 'An invoice already exists for this quote. Update the existing invoice instead.';
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_workflow_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Log the status change
    INSERT INTO workflow_state_log (
        entity_type,
        entity_id,
        previous_status,
        new_status,
        changed_by,
        change_reason
    ) VALUES (
        TG_TABLE_NAME::text,
        NEW.id,
        COALESCE(OLD.workflow_status::text, OLD.status::text),
        COALESCE(NEW.workflow_status::text, NEW.status::text),
        NEW.status_changed_by,
        'Status updated via ' || TG_OP
    );
    
    -- Update timestamp
    NEW.last_status_change = now();
    
    RETURN NEW;
END;
$function$;