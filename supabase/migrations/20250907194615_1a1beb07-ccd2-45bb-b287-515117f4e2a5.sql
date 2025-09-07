-- Create proper admin role system
-- First, create an enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create user_roles table to track admin users
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to properly check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Create helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update business_config policies to be more explicit
DROP POLICY IF EXISTS "Admin full access" ON public.business_config;

CREATE POLICY "Only admins can read business config" ON public.business_config
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can modify business config" ON public.business_config
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update business config" ON public.business_config
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete business config" ON public.business_config
  FOR DELETE
  USING (public.is_admin());

-- Fix other exposed tables
-- Pricing rules
DROP POLICY IF EXISTS "Admin full access" ON public.pricing_rules;

CREATE POLICY "Only admins can read pricing rules" ON public.pricing_rules
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can modify pricing rules" ON public.pricing_rules
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Email templates  
DROP POLICY IF EXISTS "Admin can manage email templates" ON public.email_templates;

CREATE POLICY "Only admins can access email templates" ON public.email_templates
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Audit logs - read only for admins
DROP POLICY IF EXISTS "Admin can view audit log" ON public.invoice_audit_log;
DROP POLICY IF EXISTS "Admin can view payment schedule audit" ON public.payment_schedule_audit;

CREATE POLICY "Only admins can view invoice audit log" ON public.invoice_audit_log
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can view payment schedule audit" ON public.payment_schedule_audit
  FOR SELECT
  USING (public.is_admin());

-- Workflow data
DROP POLICY IF EXISTS "Admin full access" ON public.workflow_state_log;
DROP POLICY IF EXISTS "Admin can manage workflow step completion" ON public.workflow_step_completion;

CREATE POLICY "Only admins can access workflow state log" ON public.workflow_state_log
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can access workflow step completion" ON public.workflow_step_completion
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());