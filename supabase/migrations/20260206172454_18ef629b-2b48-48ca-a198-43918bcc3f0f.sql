
-- Create has_any_role function to check if user has any authorized role
-- Returns the role name as text, or NULL if no role found
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
  AND role IN ('admin', 'staff')
  LIMIT 1;
$$;

-- Add SELECT-only RLS policy on quote_requests for staff
CREATE POLICY "Staff can view quote requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- Add SELECT-only RLS policy on staff_assignments for staff
CREATE POLICY "Staff can view staff assignments"
ON public.staff_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff'));
