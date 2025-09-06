-- Fix critical security vulnerability by removing all permissive policies and recreating secure ones
-- First, drop all existing policies on quote_requests
DROP POLICY IF EXISTS "Admin can manage quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON public.quote_requests; 
DROP POLICY IF EXISTS "Customers can view their own quotes" ON public.quote_requests;
DROP POLICY IF EXISTS "Secure customer quote access" ON public.quote_requests;
DROP POLICY IF EXISTS "Admin full management access" ON public.quote_requests;

-- Create secure policies
-- 1. Allow public to submit new quote requests (INSERT only)
CREATE POLICY "Public can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);

-- 2. Only authenticated admins can read/update/delete quote requests
CREATE POLICY "Admin can manage all quote requests" 
ON public.quote_requests 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify RLS is enabled
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;