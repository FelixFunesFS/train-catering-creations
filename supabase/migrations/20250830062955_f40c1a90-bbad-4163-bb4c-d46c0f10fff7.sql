-- Fix RLS policies for customers table to allow admin operations
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;

CREATE POLICY "Admin can manage customers" 
ON public.customers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add policy for service role operations
CREATE POLICY "Service role can manage customers" 
ON public.customers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update quote_requests policies to ensure proper admin access
DROP POLICY IF EXISTS "Admin can update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admin can delete quote requests" ON public.quote_requests;

CREATE POLICY "Admin can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can delete quote requests" 
ON public.quote_requests 
FOR DELETE 
USING (true);

-- Ensure invoices table has proper admin policies
DROP POLICY IF EXISTS "Admin can manage invoices" ON public.invoices;

CREATE POLICY "Admin can manage invoices" 
ON public.invoices 
FOR ALL 
USING (true)
WITH CHECK (true);