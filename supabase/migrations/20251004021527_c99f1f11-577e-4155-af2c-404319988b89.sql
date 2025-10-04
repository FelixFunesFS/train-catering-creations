-- Fix search_path issue in update_quote_request_status function
CREATE OR REPLACE FUNCTION public.update_quote_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When status changes, update workflow_status and timestamp
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change = now();
    
    -- Map status to workflow_status correctly using valid enum values
    CASE 
      WHEN NEW.status = 'pending' THEN 
        NEW.workflow_status = 'pending'::quote_workflow_status;
      WHEN NEW.status = 'reviewed' THEN 
        NEW.workflow_status = 'under_review'::quote_workflow_status;
      WHEN NEW.status = 'quoted' THEN 
        NEW.workflow_status = 'estimated'::quote_workflow_status;
      WHEN NEW.status = 'confirmed' THEN 
        NEW.workflow_status = 'confirmed'::quote_workflow_status;
      WHEN NEW.status = 'completed' THEN 
        NEW.workflow_status = 'completed'::quote_workflow_status;
      WHEN NEW.status = 'cancelled' THEN 
        NEW.workflow_status = 'cancelled'::quote_workflow_status;
      ELSE 
        -- Keep existing workflow_status if no mapping exists
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix search_path issue in update_invoice_status function
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
      ELSE 
        -- Keep existing workflow_status if no mapping exists
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;