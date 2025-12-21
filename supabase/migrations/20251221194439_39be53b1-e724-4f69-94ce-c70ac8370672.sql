-- Fix Function Search Path Mutable warnings
-- Add SET search_path = public to functions that are missing it

-- 1. Fix get_status_label
CREATE OR REPLACE FUNCTION public.get_status_label(status text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT CASE status
    -- Quote statuses
    WHEN 'pending' THEN 'Quote Received'
    WHEN 'under_review' THEN 'Under Review'
    WHEN 'quoted' THEN 'Quote Ready'
    WHEN 'estimated' THEN 'Estimate Sent'
    WHEN 'approved' THEN 'Approved'
    WHEN 'awaiting_payment' THEN 'Awaiting Payment'
    WHEN 'paid' THEN 'Paid in Full'
    WHEN 'confirmed' THEN 'Event Confirmed'
    WHEN 'in_progress' THEN 'Event in Progress'
    WHEN 'completed' THEN 'Completed'
    WHEN 'cancelled' THEN 'Cancelled'
    
    -- Invoice statuses
    WHEN 'draft' THEN 'Draft'
    WHEN 'pending_review' THEN 'Pending Review'
    WHEN 'sent' THEN 'Sent to Customer'
    WHEN 'viewed' THEN 'Viewed by Customer'
    WHEN 'customer_approved' THEN 'Approved by Customer'
    WHEN 'payment_pending' THEN 'Payment Pending'
    WHEN 'partially_paid' THEN 'Partially Paid'
    WHEN 'overdue' THEN 'Payment Overdue'
    
    ELSE initcap(replace(status, '_', ' '))
  END;
$function$;

-- 2. Fix get_next_statuses
CREATE OR REPLACE FUNCTION public.get_next_statuses(current_status text, entity_type text)
RETURNS text[]
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT CASE 
    -- Quote workflow transitions
    WHEN entity_type = 'quote' AND current_status = 'pending' THEN ARRAY['under_review', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'under_review' THEN ARRAY['quoted', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'quoted' THEN ARRAY['estimated', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'estimated' THEN ARRAY['approved', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'approved' THEN ARRAY['awaiting_payment', 'paid', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'awaiting_payment' THEN ARRAY['paid', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'paid' THEN ARRAY['confirmed', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'confirmed' THEN ARRAY['in_progress', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'in_progress' THEN ARRAY['completed', 'cancelled']::text[]
    WHEN entity_type = 'quote' AND current_status = 'completed' THEN ARRAY[]::text[]
    
    -- Invoice workflow transitions
    WHEN entity_type = 'invoice' AND current_status = 'draft' THEN ARRAY['pending_review', 'sent', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'pending_review' THEN ARRAY['sent', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'sent' THEN ARRAY['viewed', 'approved', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'viewed' THEN ARRAY['approved', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'approved' THEN ARRAY['payment_pending', 'paid', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'payment_pending' THEN ARRAY['partially_paid', 'paid', 'overdue', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'partially_paid' THEN ARRAY['paid', 'overdue', 'cancelled']::text[]
    WHEN entity_type = 'invoice' AND current_status = 'paid' THEN ARRAY[]::text[]
    WHEN entity_type = 'invoice' AND current_status = 'overdue' THEN ARRAY['paid', 'cancelled']::text[]
    
    -- Default: allow cancellation
    ELSE ARRAY['cancelled']::text[]
  END;
$function$;

-- 3. Fix is_valid_status_transition
CREATE OR REPLACE FUNCTION public.is_valid_status_transition(entity_type text, from_status text, to_status text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT to_status = ANY(get_next_statuses(from_status, entity_type));
$function$;

-- 4. Fix is_dev_mode
CREATE OR REPLACE FUNCTION public.is_dev_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT (
    -- Only allow if no users exist (fresh install scenario)
    (SELECT COUNT(*) FROM auth.users) = 0
  );
$function$;

-- 5. Fix is_dev_mode_original
CREATE OR REPLACE FUNCTION public.is_dev_mode_original()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
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
$function$;