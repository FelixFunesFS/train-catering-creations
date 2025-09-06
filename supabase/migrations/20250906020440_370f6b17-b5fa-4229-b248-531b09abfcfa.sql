-- Fix critical security vulnerability in quote_requests table
-- Remove the overly permissive policy that allows any authenticated user to see all quotes
DROP POLICY IF EXISTS "Admin can manage all quote requests" ON public.quote_requests;

-- Create secure policies with proper access control

-- 1. Admin can manage all quote requests (using secure is_admin() function)
CREATE POLICY "Admin can manage all quote requests" 
ON public.quote_requests 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Customers can only view their own quote requests (by email match)
CREATE POLICY "Customers can view own quote requests" 
ON public.quote_requests 
FOR SELECT 
TO authenticated
USING (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

-- 3. Keep the existing public insert policy for quote form submissions
-- (The "Public can submit quote requests" policy is already secure)

-- Verify RLS is enabled
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;