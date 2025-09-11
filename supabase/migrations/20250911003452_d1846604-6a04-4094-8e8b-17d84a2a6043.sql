-- Fix RLS policies to handle development mode authentication
-- This approach doesn't require adding dev users to auth.users table

-- Create a function that checks if we're in development mode and allows dev access
CREATE OR REPLACE FUNCTION public.is_dev_mode()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  -- In development, we allow access if no real users exist or if using dev credentials
  SELECT (
    SELECT COUNT(*) FROM auth.users
  ) = 0 OR current_setting('request.jwt.claims', true)::json->>'sub' = '00000000-0000-0000-0000-000000000001';
$$;

-- Update the is_admin function to handle dev mode
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    -- Allow dev mode access
    is_dev_mode() OR
    -- Check for actual admin role
    EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
$$;

-- Grant first admin role when first user signs up
SELECT grant_first_admin();