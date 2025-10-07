-- Phase 2: Unified Status Workflow Migration (Fixed)
-- Work with existing enum values, don't try to cast to non-existent values

-- Step 1: Update workflow state log to handle all status text
ALTER TABLE workflow_state_log 
  ALTER COLUMN previous_status TYPE text,
  ALTER COLUMN new_status TYPE text;

-- Step 2: Create helper function to get customer-friendly status labels
CREATE OR REPLACE FUNCTION get_status_label(status text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
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
$$;

-- Step 3: Create function to get next valid statuses based on current state
CREATE OR REPLACE FUNCTION get_next_statuses(current_status text, entity_type text)
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
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
$$;

-- Step 4: Create validation function for status transitions
CREATE OR REPLACE FUNCTION is_valid_status_transition(
  entity_type text,
  from_status text, 
  to_status text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT to_status = ANY(get_next_statuses(from_status, entity_type));
$$;

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_workflow_status 
  ON quote_requests(workflow_status);
  
CREATE INDEX IF NOT EXISTS idx_invoices_workflow_status 
  ON invoices(workflow_status);

CREATE INDEX IF NOT EXISTS idx_workflow_state_log_status 
  ON workflow_state_log(new_status);

CREATE INDEX IF NOT EXISTS idx_workflow_state_log_entity 
  ON workflow_state_log(entity_type, entity_id, created_at DESC);

-- Step 6: Add helpful comments
COMMENT ON FUNCTION get_status_label(text) IS 'Returns customer-friendly label for any workflow status';
COMMENT ON FUNCTION get_next_statuses(text, text) IS 'Returns array of valid next statuses for state machine validation';
COMMENT ON FUNCTION is_valid_status_transition(text, text, text) IS 'Validates if a status transition is allowed';
COMMENT ON COLUMN quote_requests.workflow_status IS 'Current workflow state - authoritative source of truth';
COMMENT ON COLUMN invoices.workflow_status IS 'Current workflow state - authoritative source of truth';