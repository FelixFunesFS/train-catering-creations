-- Fix 1: Restore secure admin authentication functions
-- CRITICAL: Replace the insecure functions that always return true

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$function$;

-- Restrict dev mode to only fresh installations (no users exist)
CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT (
    -- Only allow if no users exist (fresh install scenario)
    (SELECT COUNT(*) FROM auth.users) = 0
  );
$function$;

-- Fix 6: Add database constraints for data integrity

-- Add CASCADE to foreign keys for automatic cleanup
ALTER TABLE invoice_line_items 
DROP CONSTRAINT IF EXISTS invoice_line_items_invoice_id_fkey,
ADD CONSTRAINT invoice_line_items_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;

ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS payment_transactions_invoice_id_fkey,
ADD CONSTRAINT payment_transactions_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;

ALTER TABLE payment_milestones
DROP CONSTRAINT IF EXISTS payment_milestones_invoice_id_fkey,
ADD CONSTRAINT payment_milestones_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;

ALTER TABLE estimate_versions
DROP CONSTRAINT IF EXISTS estimate_versions_invoice_id_fkey,
ADD CONSTRAINT estimate_versions_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;

-- Add check constraints for positive amounts
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_total_amount_positive,
ADD CONSTRAINT invoices_total_amount_positive 
  CHECK (total_amount >= 0);

ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_subtotal_positive,
ADD CONSTRAINT invoices_subtotal_positive 
  CHECK (subtotal >= 0);

ALTER TABLE payment_transactions
DROP CONSTRAINT IF EXISTS payment_transactions_amount_positive,
ADD CONSTRAINT payment_transactions_amount_positive
  CHECK (amount > 0);

ALTER TABLE payment_milestones
DROP CONSTRAINT IF EXISTS payment_milestones_amount_positive,
ADD CONSTRAINT payment_milestones_amount_positive
  CHECK (amount_cents > 0);

-- Add constraint for guest count
ALTER TABLE quote_requests
DROP CONSTRAINT IF EXISTS quote_requests_guest_count_range,
ADD CONSTRAINT quote_requests_guest_count_range
  CHECK (guest_count > 0 AND guest_count <= 500);