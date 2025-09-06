-- Fix critical security vulnerability in customers table
-- Remove the overly permissive service role policy completely
DROP POLICY IF EXISTS "Service role can manage customers for business operations" ON public.customers;

-- Keep only the secure admin policy that uses is_admin() function
-- The existing "Admin can manage customers" policy is already secure

-- Verify RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;