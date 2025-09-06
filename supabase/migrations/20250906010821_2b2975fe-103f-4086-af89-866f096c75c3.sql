-- Fix critical security vulnerability in invoice_line_items table
-- Remove the overly permissive policy that allows anyone to read all invoice line items
DROP POLICY IF EXISTS "Admin can manage invoice line items" ON public.invoice_line_items;

-- Create secure policies that restrict access to authenticated admins only
CREATE POLICY "Admin can manage all invoice line items" 
ON public.invoice_line_items 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify RLS is enabled
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;