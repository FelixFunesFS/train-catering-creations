-- Fix the function search path security issues by adding SET search_path = ''
CREATE OR REPLACE FUNCTION update_quote_request_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes, update workflow_status and timestamp
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change = now();
    
    -- Map status to workflow_status correctly
    CASE 
      WHEN NEW.status = 'pending' THEN 
        NEW.workflow_status = 'pending'::quote_workflow_status;
      WHEN NEW.status = 'reviewed' THEN 
        NEW.workflow_status = 'under_review'::quote_workflow_status;
      WHEN NEW.status = 'quoted' THEN 
        NEW.workflow_status = 'quoted'::quote_workflow_status;
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix the function search path security issues by adding SET search_path = ''
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes, update workflow_status and timestamp
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change = now();
    
    -- Map status to workflow_status correctly
    CASE 
      WHEN NEW.status = 'draft' THEN 
        NEW.workflow_status = 'draft'::invoice_workflow_status;
      WHEN NEW.status = 'approved' THEN 
        NEW.workflow_status = 'approved'::invoice_workflow_status;
      WHEN NEW.status = 'sent' THEN 
        NEW.workflow_status = 'sent'::invoice_workflow_status;
      WHEN NEW.status = 'viewed' THEN 
        NEW.workflow_status = 'viewed'::invoice_workflow_status;
      WHEN NEW.status = 'paid' THEN 
        NEW.workflow_status = 'paid'::invoice_workflow_status;
      WHEN NEW.status = 'overdue' THEN 
        NEW.workflow_status = 'overdue'::invoice_workflow_status;
      WHEN NEW.status = 'cancelled' THEN 
        NEW.workflow_status = 'cancelled'::invoice_workflow_status;
      ELSE 
        -- Keep existing workflow_status if no mapping exists
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';