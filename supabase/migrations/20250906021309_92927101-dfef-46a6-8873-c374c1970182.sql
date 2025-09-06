-- Fix critical security vulnerability in quote_line_items table
-- Remove the overly permissive policy that allows anyone to access pricing data
DROP POLICY IF EXISTS "Admin can manage quote line items" ON public.quote_line_items;

-- Create secure policies with proper access control

-- 1. Admin can manage all quote line items (using secure is_admin() function)
CREATE POLICY "Admin can manage quote line items" 
ON public.quote_line_items 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Customers can only view line items for their own quotes
CREATE POLICY "Customers can view own quote line items" 
ON public.quote_line_items 
FOR SELECT 
TO authenticated
USING (
  quote_request_id IN (
    SELECT id FROM public.quote_requests 
    WHERE email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  )
);

-- Verify RLS is enabled
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;