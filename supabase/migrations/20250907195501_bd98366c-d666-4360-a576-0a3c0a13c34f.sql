-- Fix estimate_versions table security - handle existing policies properly
-- First, drop ALL existing policies to ensure clean slate
DO $$
BEGIN
    -- Drop estimate_versions policies
    DROP POLICY IF EXISTS "Public can view estimate versions" ON public.estimate_versions;
    DROP POLICY IF EXISTS "Admin can delete estimate versions" ON public.estimate_versions;  
    DROP POLICY IF EXISTS "Admin can manage estimate versions" ON public.estimate_versions;
    DROP POLICY IF EXISTS "Admin can update estimate versions" ON public.estimate_versions;
    DROP POLICY IF EXISTS "Admins can manage estimate versions" ON public.estimate_versions;
    DROP POLICY IF EXISTS "Customers can view their own estimate versions" ON public.estimate_versions;
    
    -- Drop change_requests policies
    DROP POLICY IF EXISTS "Customers can view own change requests" ON public.change_requests;
    DROP POLICY IF EXISTS "Customers can view their own change requests" ON public.change_requests;
    
    -- Drop payment_milestones policies
    DROP POLICY IF EXISTS "Admin can manage payment milestones" ON public.payment_milestones;
    DROP POLICY IF EXISTS "Admins can manage payment milestones" ON public.payment_milestones;
    DROP POLICY IF EXISTS "Customers can view their payment milestones" ON public.payment_milestones;
    
    -- Drop invoice_line_items policies
    DROP POLICY IF EXISTS "Admin can manage all invoice line items" ON public.invoice_line_items;
    DROP POLICY IF EXISTS "Admins can manage invoice line items" ON public.invoice_line_items;
    DROP POLICY IF EXISTS "Customers can view their invoice line items" ON public.invoice_line_items;
    
    -- Drop analytics_events policies
    DROP POLICY IF EXISTS "Admin can view analytics events" ON public.analytics_events;
    DROP POLICY IF EXISTS "Edge functions can insert analytics events" ON public.analytics_events;
    DROP POLICY IF EXISTS "Only admins can view analytics events" ON public.analytics_events;
    DROP POLICY IF EXISTS "Only edge functions can insert analytics events" ON public.analytics_events;
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if some policies don't exist
        NULL;
END $$;

-- Now create the new secure policies
-- estimate_versions: Admins can do everything
CREATE POLICY "secure_estimate_versions_admin_access" ON public.estimate_versions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- estimate_versions: Customers can view their own estimate versions
CREATE POLICY "secure_estimate_versions_customer_read" ON public.estimate_versions
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

-- change_requests: Secure customer access
CREATE POLICY "secure_change_requests_customer_access" ON public.change_requests
  FOR SELECT
  USING (
    customer_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR 
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE customer_access_token::text = ((current_setting('request.headers'::text, true))::json ->> 'authorization'::text)
    )
  );

-- payment_milestones: Admin management
CREATE POLICY "secure_payment_milestones_admin_access" ON public.payment_milestones
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- payment_milestones: Customer read access
CREATE POLICY "secure_payment_milestones_customer_read" ON public.payment_milestones
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

-- invoice_line_items: Admin management  
CREATE POLICY "secure_invoice_line_items_admin_access" ON public.invoice_line_items
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- invoice_line_items: Customer read access
CREATE POLICY "secure_invoice_line_items_customer_read" ON public.invoice_line_items
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

-- analytics_events: Admin read access only
CREATE POLICY "secure_analytics_events_admin_read" ON public.analytics_events
  FOR SELECT
  USING (public.is_admin());

-- analytics_events: Allow edge functions to insert
CREATE POLICY "secure_analytics_events_edge_insert" ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR public.is_admin()
  );