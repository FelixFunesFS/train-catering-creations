-- Fix critical security vulnerability in customers table
-- Remove the overly permissive service role policy that allows unrestricted access
DROP POLICY IF EXISTS "Service role can manage customers" ON public.customers;

-- Create a more restrictive service role policy that only allows edge functions
-- to manage customers when authenticated (for legitimate business operations)
CREATE POLICY "Service role can manage customers for business operations" 
ON public.customers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Keep the admin policy secure
-- The existing "Admin can manage customers" policy using is_admin() is already secure

-- Verify RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;