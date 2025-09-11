-- Check the current RLS policy for quote_requests INSERT
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'quote_requests' AND cmd = 'INSERT';

-- Fix the RLS policy by updating the INSERT policy to allow all fields for public submission
DROP POLICY IF EXISTS "Public can submit quote requests" ON public.quote_requests;

-- Create a proper INSERT policy without restrictive WITH CHECK conditions
CREATE POLICY "Public can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
WITH CHECK (true);