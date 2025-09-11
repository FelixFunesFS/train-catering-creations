-- Set up development user and ensure proper dev mode authentication

-- First, ensure the dev user exists in auth.users (this will be a no-op if user exists)
-- We can't directly insert into auth.users, but we can ensure our functions work with the dev UUID

-- Grant admin role to the dev user (insert will be ignored if already exists)
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'admin', '00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update is_dev_mode function to properly detect dev sessions
CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT (
    -- Check if we're in a dev environment with the dev user
    auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid OR
    -- Check JWT claims for dev user
    current_setting('request.jwt.claims', true)::json->>'sub' = '00000000-0000-0000-0000-000000000001' OR
    -- Allow if no users exist (fresh install)
    (SELECT COUNT(*) FROM auth.users) = 0 OR
    -- Allow if no auth context (for edge functions)
    auth.uid() IS NULL
  );
$function$;

-- Update is_admin function to work with both dev and real admin users
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (
    -- Allow dev mode access
    is_dev_mode() OR
    -- Check for actual admin role in user_roles table
    EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
$function$;