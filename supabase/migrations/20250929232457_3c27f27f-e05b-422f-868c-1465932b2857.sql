-- TEMP: Bypass authentication for development
-- TODO: Restore original functions when app is finished

-- Backup original is_admin function and create temporary bypass
CREATE OR REPLACE FUNCTION public.is_admin_original()
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

-- Backup original is_dev_mode function and create temporary bypass
CREATE OR REPLACE FUNCTION public.is_dev_mode_original()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT (
    -- Check JWT claims for dev user ID or real admin in dev mode
    current_setting('request.jwt.claims', true)::json->>'sub' = '00000000-0000-0000-0000-000000000001' OR
    current_setting('request.jwt.claims', true)::json->>'sub' = '625eab9e-6da2-4d25-b491-0549cc80a3cc' OR
    -- Check for dev session indicators
    current_setting('request.jwt.claims', true)::json->>'session_id' LIKE 'dev-session-%' OR
    -- Allow if no users exist (fresh install)
    (SELECT COUNT(*) FROM auth.users) = 0 OR
    -- Check if current user ID is the dev UUID (when properly authenticated)
    auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid OR
    -- Check if current user ID is the real admin user
    auth.uid() = '625eab9e-6da2-4d25-b491-0549cc80a3cc'::uuid OR
    -- Check for development environment indicators in JWT
    current_setting('request.jwt.claims', true)::json->>'iss' = 'supabase' AND 
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated' AND
    current_setting('request.jwt.claims', true)::json->>'email' = 'soultrainseatery@gmail.com'
  );
$function$;

-- TEMP: Override functions to always return true for development
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT true; -- TEMP: Always allow admin access for development
$function$;

CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  SELECT true; -- TEMP: Always allow dev mode for development
$function$;