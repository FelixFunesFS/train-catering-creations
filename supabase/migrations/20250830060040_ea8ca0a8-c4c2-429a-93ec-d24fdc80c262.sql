-- Fix invoice workflow status with correct enum values only
UPDATE public.invoices 
SET workflow_status = CASE 
  WHEN status = 'draft' THEN 'draft'::invoice_workflow_status
  WHEN status = 'approved' THEN 'approved'::invoice_workflow_status
  WHEN status = 'sent' THEN 'sent'::invoice_workflow_status
  WHEN status = 'viewed' THEN 'viewed'::invoice_workflow_status
  WHEN status = 'paid' THEN 'paid'::invoice_workflow_status
  WHEN status = 'overdue' THEN 'overdue'::invoice_workflow_status
  WHEN status = 'cancelled' THEN 'cancelled'::invoice_workflow_status
  ELSE 'draft'::invoice_workflow_status
END
WHERE workflow_status IS NULL;

-- Create simpler sync function that only updates valid mappings
CREATE OR REPLACE FUNCTION public.sync_workflow_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;