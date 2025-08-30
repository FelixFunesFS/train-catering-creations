-- Phase 2: Fix Core Workflows - Synchronize status fields and fix progression
-- Update all NULL workflow_status values to match their status equivalents

-- Fix quotes with NULL workflow_status
UPDATE public.quote_requests 
SET workflow_status = CASE 
  WHEN status = 'pending' THEN 'pending'::quote_workflow_status
  WHEN status = 'reviewed' THEN 'reviewed'::quote_workflow_status  
  WHEN status = 'estimated' THEN 'estimated'::quote_workflow_status
  WHEN status = 'sent' THEN 'sent'::quote_workflow_status
  WHEN status = 'approved' THEN 'approved'::quote_workflow_status
  WHEN status = 'confirmed' THEN 'confirmed'::quote_workflow_status
  WHEN status = 'rejected' THEN 'rejected'::quote_workflow_status
  ELSE 'pending'::quote_workflow_status
END
WHERE workflow_status IS NULL;

-- Fix invoices with NULL workflow_status
UPDATE public.invoices 
SET workflow_status = CASE 
  WHEN status = 'draft' THEN 'draft'::invoice_workflow_status
  WHEN status = 'pending_approval' THEN 'await_approval'::invoice_workflow_status
  WHEN status = 'approved' THEN 'approved'::invoice_workflow_status
  WHEN status = 'sent' THEN 'sent'::invoice_workflow_status
  WHEN status = 'viewed' THEN 'viewed'::invoice_workflow_status
  WHEN status = 'paid' THEN 'paid'::invoice_workflow_status
  WHEN status = 'overdue' THEN 'overdue'::invoice_workflow_status
  WHEN status = 'cancelled' THEN 'cancelled'::invoice_workflow_status
  ELSE 'draft'::invoice_workflow_status
END
WHERE workflow_status IS NULL;

-- Create function to sync workflow status when status changes
CREATE OR REPLACE FUNCTION public.sync_workflow_status()
RETURNS TRIGGER AS $$
BEGIN
  -- For quote_requests table
  IF TG_TABLE_NAME = 'quote_requests' THEN
    NEW.workflow_status = CASE 
      WHEN NEW.status = 'pending' THEN 'pending'::quote_workflow_status
      WHEN NEW.status = 'reviewed' THEN 'reviewed'::quote_workflow_status  
      WHEN NEW.status = 'estimated' THEN 'estimated'::quote_workflow_status
      WHEN NEW.status = 'sent' THEN 'sent'::quote_workflow_status
      WHEN NEW.status = 'approved' THEN 'approved'::quote_workflow_status
      WHEN NEW.status = 'confirmed' THEN 'confirmed'::quote_workflow_status
      WHEN NEW.status = 'rejected' THEN 'rejected'::quote_workflow_status
      ELSE NEW.workflow_status
    END;
  END IF;
  
  -- For invoices table
  IF TG_TABLE_NAME = 'invoices' THEN
    NEW.workflow_status = CASE 
      WHEN NEW.status = 'draft' THEN 'draft'::invoice_workflow_status
      WHEN NEW.status = 'pending_approval' THEN 'await_approval'::invoice_workflow_status
      WHEN NEW.status = 'approved' THEN 'approved'::invoice_workflow_status
      WHEN NEW.status = 'sent' THEN 'sent'::invoice_workflow_status
      WHEN NEW.status = 'viewed' THEN 'viewed'::invoice_workflow_status
      WHEN NEW.status = 'paid' THEN 'paid'::invoice_workflow_status
      WHEN NEW.status = 'overdue' THEN 'overdue'::invoice_workflow_status
      WHEN NEW.status = 'cancelled' THEN 'cancelled'::invoice_workflow_status
      ELSE NEW.workflow_status
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to sync workflow status
DROP TRIGGER IF EXISTS sync_quote_workflow_status ON public.quote_requests;
CREATE TRIGGER sync_quote_workflow_status
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_workflow_status();

DROP TRIGGER IF EXISTS sync_invoice_workflow_status ON public.invoices;  
CREATE TRIGGER sync_invoice_workflow_status
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_workflow_status();