-- Fix RLS policy conflict for quote_requests table
-- The ALL policy with is_admin() check was blocking non-admin INSERTs

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can submit quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can submit quote requests" ON quote_requests;

-- Create unified INSERT policy for both anon and authenticated users
CREATE POLICY "Anyone can submit quote requests" ON quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create separate admin policies (excluding INSERT)
CREATE POLICY "Admins can view all quote requests" ON quote_requests
FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update quote requests" ON quote_requests
FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete quote requests" ON quote_requests
FOR DELETE TO authenticated
USING (is_admin());