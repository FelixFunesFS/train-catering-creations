-- Add explicit RLS policies to event_summary view for defense-in-depth
-- The view already uses security_invoker=true, but explicit policies add clarity

-- Enable RLS on the view
ALTER VIEW event_summary SET (security_invoker = true);

-- Note: In PostgreSQL, RLS cannot be directly enabled on views.
-- The security_invoker setting ensures underlying table RLS is respected.
-- For additional protection, we can create a SECURITY DEFINER function
-- that wraps access to the view with explicit role checks.

-- Create a secure function to access event summary data
CREATE OR REPLACE FUNCTION public.get_event_summary_for_user()
RETURNS SETOF event_summary
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT es.*
  FROM event_summary es
  WHERE 
    -- Admins can see all events
    is_admin()
    OR
    -- Customers can only see their own events (by email match)
    es.email = (current_setting('request.jwt.claims', true)::json->>'email');
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_event_summary_for_user() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_event_summary_for_user() FROM anon, public;

-- Add comment explaining security model
COMMENT ON FUNCTION public.get_event_summary_for_user() IS 
'Secure access to event_summary view with explicit role-based filtering. 
Admins see all events, customers see only their own events by email match.
This provides defense-in-depth alongside the view''s security_invoker setting.';