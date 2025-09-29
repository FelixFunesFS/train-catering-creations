-- TEMPORARY: Disable RLS on quote_requests for development
-- This allows quotes to display without authentication during app development
-- TODO: Re-enable RLS when authentication is implemented

ALTER TABLE public.quote_requests DISABLE ROW LEVEL SECURITY;