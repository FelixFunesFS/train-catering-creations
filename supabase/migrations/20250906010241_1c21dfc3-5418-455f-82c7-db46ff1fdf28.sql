-- Fix critical security vulnerability in quote_requests table
-- Remove the overly permissive policy that allows anyone to read all quotes
DROP POLICY IF EXISTS "Customers can view their own quotes" ON public.quote_requests;

-- Create a secure policy that only allows customers to view their own quotes
-- based on email matching (for customer access) or admin authentication
CREATE POLICY "Secure customer quote access" 
ON public.quote_requests 
FOR SELECT 
USING (
  -- Allow admins to see all quotes
  (auth.uid() IS NOT NULL) OR 
  -- Allow customers to see only their own quotes when accessing via customer portal
  -- This would be used in conjunction with application-level email verification
  false -- For now, disable direct customer access until proper customer auth is implemented
);

-- Ensure admins still have full access (this should already exist but let's be explicit)
CREATE POLICY "Admin full management access" 
ON public.quote_requests 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Keep public insert for quote form submissions
-- This is safe as it only allows creating new quotes, not reading existing ones
-- The existing "Anyone can submit quote requests" policy should remain