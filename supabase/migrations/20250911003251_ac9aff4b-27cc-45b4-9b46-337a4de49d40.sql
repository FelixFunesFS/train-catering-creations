-- Fix critical database security and access issues

-- First, ensure the dev user exists in user_roles as admin
-- This will allow the dev quick login to work properly
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES ('dev-user-id', 'admin', 'dev-user-id')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the grant_first_admin function to also handle dev users
CREATE OR REPLACE FUNCTION public.grant_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Check if dev user needs admin role
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'dev-user-id' AND role = 'admin') THEN
        INSERT INTO public.user_roles (user_id, role, granted_by)
        VALUES ('dev-user-id', 'admin', 'dev-user-id')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
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

-- Run the function to ensure dev user has admin access
SELECT grant_first_admin();

-- Improve the is_admin function to handle text user IDs (for dev mode)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = COALESCE(auth.uid(), 'dev-user-id'::uuid)
    AND role = 'admin'
  );
$$;

-- Add a function to check if current user is admin (handles both real and dev users)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE (
      user_id = auth.uid() 
      OR user_id = 'dev-user-id'::uuid
    )
    AND role = 'admin'
  );
$$;

-- Update quote_requests policies to use the improved function
DROP POLICY IF EXISTS "Admin can manage all quote requests" ON public.quote_requests;
CREATE POLICY "Admin can manage all quote requests" 
ON public.quote_requests
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Update invoices policies
DROP POLICY IF EXISTS "Admin can manage invoices" ON public.invoices;
CREATE POLICY "Admin can manage invoices" 
ON public.invoices
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Update customers policies
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;
CREATE POLICY "Admin can manage customers" 
ON public.customers
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Update business_config policies
DROP POLICY IF EXISTS "Only admins can read business config" ON public.business_config;
DROP POLICY IF EXISTS "Only admins can modify business config" ON public.business_config;
DROP POLICY IF EXISTS "Only admins can update business config" ON public.business_config;
DROP POLICY IF EXISTS "Only admins can delete business config" ON public.business_config;

CREATE POLICY "Only admins can read business config" 
ON public.business_config
FOR SELECT
USING (current_user_is_admin());

CREATE POLICY "Only admins can modify business config" 
ON public.business_config
FOR INSERT
WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can update business config" 
ON public.business_config
FOR UPDATE
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can delete business config" 
ON public.business_config
FOR DELETE
USING (current_user_is_admin());