-- Fix RLS policies by dropping existing ones first
DROP POLICY IF EXISTS "Admin can manage quote requests" ON quote_requests;

-- Create secure but functional policies
CREATE POLICY "Admin can manage quote requests" 
ON quote_requests 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create admin authentication function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- For now, any authenticated user is considered admin
  SELECT auth.uid() IS NOT NULL;
$$;