-- Fix workflow status migration - check actual enum values first and map correctly
-- Update quotes with correct enum mapping
UPDATE public.quote_requests 
SET workflow_status = CASE 
  WHEN status = 'pending' THEN 'pending'::quote_workflow_status
  WHEN status = 'estimated' THEN 'estimated'::quote_workflow_status
  WHEN status = 'sent' THEN 'sent'::quote_workflow_status
  WHEN status = 'approved' THEN 'approved'::quote_workflow_status
  WHEN status = 'confirmed' THEN 'confirmed'::quote_workflow_status
  WHEN status = 'rejected' THEN 'rejected'::quote_workflow_status
  WHEN status = 'cancelled' THEN 'cancelled'::quote_workflow_status
  ELSE 'pending'::quote_workflow_status
END
WHERE workflow_status IS NULL;

-- Update invoices workflow status  
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