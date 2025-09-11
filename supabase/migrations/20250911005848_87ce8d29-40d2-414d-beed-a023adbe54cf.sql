-- Fix trigger issue and update statuses
DROP TRIGGER IF EXISTS update_quote_request_status_trigger ON quote_requests;

-- Update quote statuses based on invoice state
UPDATE quote_requests 
SET status = 'quoted', workflow_status = 'quoted'
WHERE id IN (
  SELECT qr.id 
  FROM quote_requests qr
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending' 
  AND i.total_amount > 0
  AND i.is_draft = true
);

UPDATE quote_requests
SET status = 'confirmed', workflow_status = 'confirmed'
WHERE id IN (
  SELECT qr.id
  FROM quote_requests qr 
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending'
  AND i.status IN ('sent', 'viewed', 'approved')
);

-- Recreate the trigger with proper enum handling
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
    
    -- Map status to workflow_status correctly
    CASE 
      WHEN NEW.status::text = 'pending' THEN 
        NEW.workflow_status = 'pending';
      WHEN NEW.status::text = 'reviewed' THEN 
        NEW.workflow_status = 'under_review';
      WHEN NEW.status::text = 'quoted' THEN 
        NEW.workflow_status = 'quoted';
      WHEN NEW.status::text = 'confirmed' THEN 
        NEW.workflow_status = 'confirmed';
      WHEN NEW.status::text = 'completed' THEN 
        NEW.workflow_status = 'completed';
      WHEN NEW.status::text = 'cancelled' THEN 
        NEW.workflow_status = 'cancelled';
      ELSE 
        -- Keep existing workflow_status if no mapping exists
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_quote_request_status_trigger
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_request_status();