-- Update is_dev_mode function to better handle development sessions
CREATE OR REPLACE FUNCTION public.is_dev_mode()
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
$function$