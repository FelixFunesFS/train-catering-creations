-- Fix 1: Restrict analytics_events INSERT to service role only (edge functions)
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "secure_analytics_events_edge_insert" ON analytics_events;

-- Create new restrictive policy - only service role can insert
-- Since edge functions use service role key, they bypass RLS entirely
-- For anon/authenticated users, we block all inserts
CREATE POLICY "secure_analytics_events_service_only_insert" 
ON analytics_events 
FOR INSERT 
TO authenticated, anon
WITH CHECK (false);

-- Note: Service role bypasses RLS, so edge functions can still insert
-- This blocks any direct client-side analytics insertion attempts

-- Add comment explaining the security model
COMMENT ON TABLE analytics_events IS 'Analytics events table - INSERT restricted to edge functions only (service role). Client-side inserts are blocked for security.';