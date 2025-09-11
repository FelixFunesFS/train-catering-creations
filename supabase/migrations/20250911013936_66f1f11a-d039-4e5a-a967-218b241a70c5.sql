-- Fix security warning: set search_path for functions

-- Update is_dev_mode function with proper search_path
CREATE OR REPLACE FUNCTION public.is_dev_mode()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path = public
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