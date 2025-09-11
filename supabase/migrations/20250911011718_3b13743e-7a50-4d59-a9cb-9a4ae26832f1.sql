-- Fix the trigger function and sync quote statuses

-- Drop and recreate the trigger function with proper enum handling
DROP FUNCTION IF EXISTS public.update_quote_request_status() CASCADE;

CREATE OR REPLACE FUNCTION public.update_quote_request_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Update quotes that have draft estimates to 'quoted' status  
UPDATE quote_requests 
SET 
  status = 'quoted',
  workflow_status = 'estimated',
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.is_draft = true 
  AND qr.status = 'pending'
);

-- Update quotes that have approved/final invoices to 'confirmed' status
UPDATE quote_requests 
SET 
  status = 'confirmed', 
  workflow_status = 'confirmed',
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.is_draft = false 
  AND qr.status IN ('pending', 'quoted')
);

-- Update quotes that have paid invoices to 'completed' status
UPDATE quote_requests 
SET 
  status = 'completed',
  workflow_status = 'completed', 
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.status = 'paid'
  AND qr.status != 'completed'
);

-- Recreate the trigger
CREATE TRIGGER update_quote_status_trigger
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_request_status();