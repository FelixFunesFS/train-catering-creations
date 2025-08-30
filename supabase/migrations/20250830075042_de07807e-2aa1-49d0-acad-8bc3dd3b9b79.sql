-- Fix RLS policy for invoice_line_items to allow admin access
ALTER POLICY "Admin can manage invoice line items" ON public.invoice_line_items
USING (true)
WITH CHECK (true);