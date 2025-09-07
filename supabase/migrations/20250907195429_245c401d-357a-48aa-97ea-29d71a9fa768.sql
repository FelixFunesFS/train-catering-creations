-- Fix estimate_versions table security
-- First, drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view estimate versions" ON public.estimate_versions;
DROP POLICY IF EXISTS "Admin can delete estimate versions" ON public.estimate_versions;  
DROP POLICY IF EXISTS "Admin can manage estimate versions" ON public.estimate_versions;
DROP POLICY IF EXISTS "Admin can update estimate versions" ON public.estimate_versions;

-- Create proper secure policies for estimate_versions
-- Admins can do everything
CREATE POLICY "Admins can manage estimate versions" ON public.estimate_versions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Customers can view estimate versions for their own invoices
CREATE POLICY "Customers can view their own estimate versions" ON public.estimate_versions
  FOR SELECT
  USING (
    -- Allow if this estimate version belongs to an invoice that the customer can access
    invoice_id IN (
      SELECT i.id 
      FROM invoices i
      LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
      WHERE 
        -- Customer can access via email match
        (qr.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text))
        OR 
        -- Customer can access via access token in headers
        (i.customer_access_token::text = ((current_setting('request.headers'::text, true))::json ->> 'authorization'::text))
    )
  );

-- Fix change_requests table - currently allows public viewing
DROP POLICY IF EXISTS "Customers can view own change requests" ON public.change_requests;

CREATE POLICY "Customers can view their own change requests" ON public.change_requests
  FOR SELECT
  USING (
    customer_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR 
    -- Allow access via invoice access token if change request is linked to an invoice
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE customer_access_token::text = ((current_setting('request.headers'::text, true))::json ->> 'authorization'::text)
    )
  );

-- Fix payment_milestones - currently allows any authenticated user
DROP POLICY IF EXISTS "Admin can manage payment milestones" ON public.payment_milestones;

CREATE POLICY "Admins can manage payment milestones" ON public.payment_milestones
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Customers can view their payment milestones" ON public.payment_milestones
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT i.id 
      FROM invoices i
      LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
      WHERE 
        (qr.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text))
        OR 
        (i.customer_access_token::text = ((current_setting('request.headers'::text, true))::json ->> 'authorization'::text))
    )
  );

-- Fix invoice_line_items - currently allows any authenticated user
DROP POLICY IF EXISTS "Admin can manage all invoice line items" ON public.invoice_line_items;

CREATE POLICY "Admins can manage invoice line items" ON public.invoice_line_items
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Customers can view their invoice line items" ON public.invoice_line_items
  FOR SELECT
  USING (
    invoice_id IN (
      SELECT i.id 
      FROM invoices i
      LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
      WHERE 
        (qr.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text))
        OR 
        (i.customer_access_token::text = ((current_setting('request.headers'::text, true))::json ->> 'authorization'::text))
    )
  );

-- Fix analytics_events - restrict to admin only
DROP POLICY IF EXISTS "Admin can view analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Edge functions can insert analytics events" ON public.analytics_events;

CREATE POLICY "Only admins can view analytics events" ON public.analytics_events
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only edge functions can insert analytics events" ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    -- Allow edge functions to insert (they don't have user context)
    auth.uid() IS NULL 
    OR 
    -- Allow admins to insert
    public.is_admin()
  );