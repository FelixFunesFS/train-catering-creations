-- Allow authenticated users (not just admins) to submit quote requests
-- This fixes the issue where logged-in testers/users cannot submit quotes
CREATE POLICY "Authenticated users can submit quote requests" 
ON public.quote_requests
FOR INSERT
TO authenticated
WITH CHECK (true);