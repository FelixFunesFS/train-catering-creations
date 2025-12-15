-- Drop the existing policy with wrong role
DROP POLICY IF EXISTS "Public can submit quote requests" ON quote_requests;

-- Create new policy with correct anon role for anonymous form submissions
CREATE POLICY "Anonymous users can submit quote requests" 
ON quote_requests
FOR INSERT
TO anon
WITH CHECK (true);