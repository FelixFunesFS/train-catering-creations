-- Insert an initial admin user (you'll need to replace this with the actual user ID after they sign up)
-- This creates a function to grant admin access to the first authenticated user
CREATE OR REPLACE FUNCTION public.grant_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users if no admin exists yet
    SELECT id INTO first_user_id 
    FROM auth.users 
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE role = 'admin'
    )
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Grant admin role to first user if found and no admin exists
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role, granted_by)
        VALUES (first_user_id, 'admin', first_user_id)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Call the function to grant admin to first user
SELECT public.grant_first_admin();