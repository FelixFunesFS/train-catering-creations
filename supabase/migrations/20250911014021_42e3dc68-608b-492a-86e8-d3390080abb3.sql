-- Fix dev mode authentication without requiring dev user in auth.users

-- Update is_dev_mode function to properly detect dev environment
CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT (
    -- Check JWT claims for dev user ID
    current_setting('request.jwt.claims', true)::json->>'sub' = '00000000-0000-0000-0000-000000000001' OR
    -- Allow if no users exist (fresh install)
    (SELECT COUNT(*) FROM auth.users) = 0 OR
    -- Check if current user ID is the dev UUID (when properly authenticated)
    auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid
  );
$function$;

-- Update is_admin function to work with dev mode
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (
    -- Allow dev mode access (including dev user)
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