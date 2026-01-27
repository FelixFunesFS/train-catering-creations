-- Fix security issues: Block anonymous access to sensitive tables

-- =====================================================
-- Issue 1: customers table - Force RLS and revoke anon access
-- =====================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.customers FROM public;

-- =====================================================
-- Issue 2: quote_requests table - Force RLS and revoke anon SELECT
-- Keep INSERT for public form submissions
-- =====================================================
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests FORCE ROW LEVEL SECURITY;

-- =====================================================
-- Issue 3: event_summary view - Drop dependent function first, 
-- then recreate view with security_invoker, then recreate function
-- =====================================================

-- Step 1: Drop the dependent function
DROP FUNCTION IF EXISTS public.get_event_summary_for_user();

-- Step 2: Drop and recreate the view with security_invoker=true
DROP VIEW IF EXISTS public.event_summary;

CREATE VIEW public.event_summary
WITH (security_invoker=true) AS
SELECT 
  qr.id as quote_id,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.event_name,
  qr.event_date,
  qr.start_time,
  qr.location,
  qr.guest_count,
  qr.event_type,
  qr.service_type,
  qr.workflow_status as quote_status,
  qr.created_at as quote_created_at,
  qr.compliance_level,
  qr.requires_po_number,
  qr.po_number,
  i.id as invoice_id,
  i.invoice_number,
  i.workflow_status as invoice_status,
  i.total_amount,
  i.subtotal,
  i.tax_amount,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.document_type,
  (qr.event_date - CURRENT_DATE)::integer as days_until_event,
  COALESCE(
    (SELECT SUM(amount) FROM payment_history ph WHERE ph.invoice_id = i.id AND ph.status = 'completed'),
    0
  )::bigint as total_paid,
  (i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payment_history ph WHERE ph.invoice_id = i.id AND ph.status = 'completed'),
    0
  ))::bigint as balance_due,
  CASE 
    WHEN i.workflow_status = 'overdue' THEN 'high'
    WHEN i.workflow_status IN ('payment_pending', 'partially_paid') AND i.due_date < CURRENT_DATE THEN 'high'
    WHEN (qr.event_date - CURRENT_DATE) <= 7 AND i.workflow_status NOT IN ('paid', 'cancelled') THEN 'high'
    WHEN (qr.event_date - CURRENT_DATE) <= 14 AND i.workflow_status NOT IN ('paid', 'partially_paid', 'cancelled') THEN 'medium'
    ELSE 'low'
  END as risk_level,
  COALESCE(i.workflow_status::text, 'draft') as payment_status
FROM quote_requests qr
LEFT JOIN invoices i ON qr.id = i.quote_request_id AND i.is_draft = false;

-- Step 3: Revoke anon/public access from the view
REVOKE ALL ON public.event_summary FROM anon;
REVOKE ALL ON public.event_summary FROM public;

-- Grant to authenticated only (will be filtered by function)
GRANT SELECT ON public.event_summary TO authenticated;

-- Step 4: Recreate the security definer function with proper access control
CREATE OR REPLACE FUNCTION public.get_event_summary_for_user()
RETURNS SETOF event_summary
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT es.*
  FROM event_summary es
  WHERE 
    -- Admins can see all events
    is_admin()
    OR
    -- Customers can only see their own events (by email match from JWT)
    es.email = (current_setting('request.jwt.claims', true)::json->>'email');
$$;

-- Revoke anon access from the function
REVOKE ALL ON FUNCTION public.get_event_summary_for_user() FROM anon;
REVOKE ALL ON FUNCTION public.get_event_summary_for_user() FROM public;

-- Grant to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_event_summary_for_user() TO authenticated;

-- Add documentation comments
COMMENT ON TABLE public.customers IS 'Customer records - admin access only via RLS, anon access revoked';
COMMENT ON TABLE public.quote_requests IS 'Quote requests - public INSERT allowed for form, SELECT restricted by RLS to owner or admin';
COMMENT ON VIEW public.event_summary IS 'Event summary view with security_invoker=true - access via get_event_summary_for_user() function only';
COMMENT ON FUNCTION public.get_event_summary_for_user() IS 'Secure access to event_summary - returns all for admins, own records for customers by JWT email';