-- Fix RLS policies for customers, quote_requests, invoices tables
-- and secure the event_summary view

-- ============================================
-- 1. CUSTOMERS TABLE - Only admin access
-- ============================================
-- Drop existing policy and recreate as PERMISSIVE (needed for RLS to work)
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;

-- Create PERMISSIVE admin-only policy
CREATE POLICY "Admin can manage customers" 
ON public.customers 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 2. QUOTE_REQUESTS TABLE - Fix policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anonymous users can submit quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Authenticated users can submit quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Customers can view own quote requests" ON public.quote_requests;

-- Admin full access (PERMISSIVE)
CREATE POLICY "Admin can manage all quote requests" 
ON public.quote_requests 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Anonymous users can INSERT only (PERMISSIVE for anon role)
CREATE POLICY "Anonymous users can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Authenticated users can INSERT (PERMISSIVE)
CREATE POLICY "Authenticated users can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Customers can view only their own quote requests by email match
CREATE POLICY "Customers can view own quote requests" 
ON public.quote_requests 
FOR SELECT 
TO authenticated
USING (
  email = (current_setting('request.jwt.claims', true)::json->>'email')
  OR is_admin()
);

-- ============================================
-- 3. INVOICES TABLE - Fix policies
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Customers can view their estimates" ON public.invoices;

-- Admin full access (PERMISSIVE)
CREATE POLICY "Admin can manage invoices" 
ON public.invoices 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Customers can view their own invoices/estimates via token or email
CREATE POLICY "Customers can view their invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (
  quote_request_id IN (
    SELECT id FROM quote_requests 
    WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  )
  OR is_admin()
);

-- Allow token-based access for customer portal (anonymous)
CREATE POLICY "Token based invoice access" 
ON public.invoices 
FOR SELECT 
TO anon
USING (
  customer_access_token::text = (current_setting('request.headers', true)::json->>'x-customer-token')
  AND (token_expires_at IS NULL OR token_expires_at > now())
);

-- ============================================
-- 4. EVENT_SUMMARY VIEW - Recreate with security
-- ============================================
-- Drop and recreate the view with SECURITY INVOKER (default)
-- This ensures RLS from underlying tables is respected
DROP VIEW IF EXISTS public.event_summary;

CREATE VIEW public.event_summary 
WITH (security_invoker = true)
AS
SELECT 
  qr.id as quote_id,
  qr.event_name,
  qr.event_type,
  qr.event_date,
  qr.start_time,
  qr.guest_count,
  qr.service_type,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.location,
  qr.workflow_status as quote_status,
  qr.created_at as quote_created_at,
  qr.compliance_level,
  qr.po_number,
  qr.requires_po_number,
  i.id as invoice_id,
  i.invoice_number,
  i.workflow_status as invoice_status,
  i.document_type,
  i.subtotal,
  i.tax_amount,
  i.total_amount,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) as total_paid,
  i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) as balance_due,
  CASE 
    WHEN qr.event_date IS NULL THEN NULL
    ELSE (qr.event_date - CURRENT_DATE)
  END as days_until_event,
  CASE
    WHEN i.workflow_status = 'paid' THEN 'paid'
    WHEN i.workflow_status = 'partially_paid' THEN 'partial'
    WHEN i.workflow_status = 'overdue' THEN 'overdue'
    WHEN i.workflow_status IN ('sent', 'viewed', 'approved', 'payment_pending') THEN 'pending'
    ELSE 'draft'
  END as payment_status,
  CASE
    WHEN qr.event_date < CURRENT_DATE THEN 'past'
    WHEN qr.event_date - CURRENT_DATE <= 7 THEN 'high'
    WHEN qr.event_date - CURRENT_DATE <= 14 THEN 'medium'
    ELSE 'low'
  END as risk_level
FROM quote_requests qr
LEFT JOIN invoices i ON i.quote_request_id = qr.id AND i.is_draft = false;

-- Grant access to the view (RLS will be enforced via underlying tables)
GRANT SELECT ON public.event_summary TO authenticated;

-- ============================================
-- 5. INVOICE_PAYMENT_SUMMARY VIEW - Also secure
-- ============================================
DROP VIEW IF EXISTS public.invoice_payment_summary;

CREATE VIEW public.invoice_payment_summary
WITH (security_invoker = true)
AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.workflow_status,
  i.subtotal,
  i.tax_amount,
  i.total_amount,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.reminder_count,
  i.last_reminder_sent_at,
  i.created_at as invoice_created_at,
  qr.id as quote_id,
  qr.event_name,
  qr.event_type,
  qr.event_date,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.location,
  qr.guest_count,
  qr.guest_count_with_restrictions,
  qr.service_type,
  qr.special_requests,
  qr.vegetarian_entrees,
  qr.compliance_level,
  qr.requires_po_number,
  COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) as total_paid,
  i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) as balance_remaining,
  CASE 
    WHEN i.due_date IS NULL THEN NULL
    WHEN i.due_date < CURRENT_DATE AND i.workflow_status NOT IN ('paid', 'cancelled') 
    THEN (CURRENT_DATE - i.due_date)
    ELSE 0
  END as days_overdue,
  (
    SELECT json_agg(pm.* ORDER BY pm.due_date NULLS LAST)
    FROM payment_milestones pm 
    WHERE pm.invoice_id = i.id
  ) as milestones
FROM invoices i
LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
WHERE i.is_draft = false;

GRANT SELECT ON public.invoice_payment_summary TO authenticated;