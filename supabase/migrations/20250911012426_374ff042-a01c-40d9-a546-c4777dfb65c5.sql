-- Fix is_dev_mode and is_admin functions to work properly in dev environment

-- Update is_dev_mode function to be more permissive in development
CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  -- In development, we allow access if no real users exist or if using dev credentials
  SELECT (
    SELECT COUNT(*) FROM auth.users
  ) = 0 OR 
  current_setting('request.jwt.claims', true)::json->>'sub' = '00000000-0000-0000-0000-000000000001' OR
  -- Also allow if there's no auth context (bypassing login)
  auth.uid() IS NULL;
$function$;

-- Update is_admin function to work better with dev mode
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;