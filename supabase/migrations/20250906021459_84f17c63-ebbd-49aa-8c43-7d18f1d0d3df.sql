-- Fix critical security vulnerability in payment_transactions table
-- Remove the overly permissive policy that allows any user to see all transactions
DROP POLICY IF EXISTS "Customers can view own transactions" ON public.payment_transactions;

-- Create secure policy that only allows customers to view their own transactions
CREATE POLICY "Customers can view own transactions" 
ON public.payment_transactions 
FOR SELECT 
TO authenticated
USING (
  customer_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
);

-- Verify RLS is enabled
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;