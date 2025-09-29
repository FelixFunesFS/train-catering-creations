-- Fix the trigger function to use text instead of enum, then run clean slate migration

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS update_invoice_status_trigger ON public.invoices;

-- Fix the function to use text instead of enum
CREATE OR REPLACE FUNCTION public.update_invoice_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- Recreate the trigger
CREATE TRIGGER update_invoice_status_trigger 
BEFORE UPDATE ON public.invoices 
FOR EACH ROW 
EXECUTE FUNCTION public.update_invoice_status();

-- Now run the clean slate migration
-- Create archive table for existing invoice line items
CREATE TABLE public.invoice_line_items_archive (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_invoice_line_item_id uuid NOT NULL,
  invoice_id uuid,
  title text,
  description text NOT NULL,
  category text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price integer NOT NULL,
  total_price integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  archive_reason text DEFAULT 'clean_slate_migration'
);

-- Archive existing invoice line items
INSERT INTO public.invoice_line_items_archive (
  original_invoice_line_item_id,
  invoice_id,
  title,
  description,
  category,
  quantity,
  unit_price,
  total_price,
  created_at
)
SELECT 
  id,
  invoice_id,
  title,
  description,
  category,
  quantity,
  unit_price,
  total_price,
  created_at
FROM public.invoice_line_items;

-- Delete all existing invoice line items
DELETE FROM public.invoice_line_items;

-- Reset all invoices to draft status to allow regeneration
UPDATE public.invoices 
SET 
  status = 'draft',
  is_draft = true,
  subtotal = 0,
  tax_amount = 0,
  total_amount = 0,
  last_status_change = now(),
  updated_at = now(),
  status_changed_by = 'clean_slate_migration'
WHERE status != 'draft' OR is_draft = false;

-- Add RLS policy for archive table
ALTER TABLE public.invoice_line_items_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secure_invoice_line_items_archive_admin_access" 
ON public.invoice_line_items_archive 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());