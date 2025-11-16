-- Phase 3: Workflow State Consistency
-- Create comprehensive unified workflow status view
CREATE OR REPLACE VIEW unified_workflow_status AS
SELECT 
  q.id as quote_id,
  q.contact_name,
  q.email,
  q.event_name,
  q.event_date,
  q.workflow_status as quote_status,
  q.last_status_change as quote_status_changed_at,
  q.status_changed_by as quote_status_changed_by,
  i.id as invoice_id,
  i.workflow_status as invoice_status,
  i.last_status_change as invoice_status_changed_at,
  i.status_changed_by as invoice_status_changed_by,
  i.total_amount,
  i.document_type,
  ws.current_step as workflow_current_step,
  ws.completed_steps as workflow_completed_steps,
  ws.last_updated as workflow_last_updated,
  c.id as contract_id,
  c.status as contract_status,
  c.signed_at as contract_signed_at,
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'milestone_type', pm.milestone_type,
        'status', pm.status,
        'amount_cents', pm.amount_cents,
        'due_date', pm.due_date
      ) ORDER BY pm.percentage
    )
    FROM payment_milestones pm
    WHERE pm.invoice_id = i.id),
    '[]'::jsonb
  ) as payment_milestones,
  -- Calculated fields
  CASE 
    WHEN q.workflow_status != 'cancelled' AND i.workflow_status = 'cancelled' THEN true
    WHEN q.workflow_status = 'confirmed' AND i.workflow_status != 'paid' THEN true
    WHEN q.workflow_status = 'approved' AND i.workflow_status NOT IN ('approved', 'payment_pending', 'partially_paid', 'paid') THEN true
    ELSE false
  END as has_status_mismatch,
  q.created_at,
  q.updated_at
FROM quote_requests q
LEFT JOIN invoices i ON i.quote_request_id = q.id AND i.is_draft = false
LEFT JOIN workflow_state ws ON ws.quote_request_id = q.id
LEFT JOIN contracts c ON c.invoice_id = i.id;

-- Add trigger to auto-sync quote status when invoice status changes
CREATE OR REPLACE FUNCTION sync_invoice_to_quote_workflow()
RETURNS TRIGGER AS $$
DECLARE
  target_quote_status quote_workflow_status;
BEGIN
  -- Only sync if quote_request_id exists and workflow_status actually changed
  IF NEW.quote_request_id IS NULL OR OLD.workflow_status = NEW.workflow_status THEN
    RETURN NEW;
  END IF;

  -- Map invoice statuses to quote statuses
  target_quote_status := CASE NEW.workflow_status
    WHEN 'draft' THEN 'pending'::quote_workflow_status
    WHEN 'pending_review' THEN 'under_review'::quote_workflow_status
    WHEN 'sent' THEN 'estimated'::quote_workflow_status
    WHEN 'viewed' THEN 'estimated'::quote_workflow_status
    WHEN 'approved' THEN 'approved'::quote_workflow_status
    WHEN 'payment_pending' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'partially_paid' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'paid' THEN 'confirmed'::quote_workflow_status
    WHEN 'overdue' THEN 'awaiting_payment'::quote_workflow_status
    WHEN 'cancelled' THEN 'cancelled'::quote_workflow_status
    ELSE 'pending'::quote_workflow_status
  END;

  -- Update quote status to match invoice
  UPDATE quote_requests
  SET 
    workflow_status = target_quote_status,
    last_status_change = now(),
    status_changed_by = COALESCE(NEW.status_changed_by, 'auto_sync'),
    updated_at = now()
  WHERE id = NEW.quote_request_id
    AND workflow_status != target_quote_status; -- Only update if different

  -- Log the sync action
  INSERT INTO workflow_state_log (
    entity_type,
    entity_id,
    previous_status,
    new_status,
    changed_by,
    change_reason,
    metadata
  ) VALUES (
    'quote_requests',
    NEW.quote_request_id,
    (SELECT workflow_status::text FROM quote_requests WHERE id = NEW.quote_request_id),
    target_quote_status::text,
    COALESCE(NEW.status_changed_by, 'auto_sync'),
    'Auto-synced from invoice status change',
    jsonb_build_object(
      'invoice_id', NEW.id,
      'invoice_status', NEW.workflow_status::text,
      'sync_trigger', 'sync_invoice_to_quote_workflow'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_invoice_to_quote ON invoices;

-- Create trigger on invoice workflow_status changes
CREATE TRIGGER trigger_sync_invoice_to_quote
  AFTER UPDATE OF workflow_status ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_invoice_to_quote_workflow();

-- Add helper function to check workflow consistency
CREATE OR REPLACE FUNCTION check_workflow_consistency(p_quote_id uuid)
RETURNS TABLE(
  is_consistent boolean,
  issues jsonb
) AS $$
DECLARE
  v_quote_status quote_workflow_status;
  v_invoice_status invoice_workflow_status;
  v_has_invoice boolean;
  v_issues jsonb := '[]'::jsonb;
BEGIN
  -- Get quote status
  SELECT workflow_status INTO v_quote_status
  FROM quote_requests
  WHERE id = p_quote_id;

  -- Check if invoice exists
  SELECT 
    i.workflow_status,
    true
  INTO v_invoice_status, v_has_invoice
  FROM invoices i
  WHERE i.quote_request_id = p_quote_id
    AND i.is_draft = false
  LIMIT 1;

  -- Check for inconsistencies
  IF v_has_invoice THEN
    -- Quote marked as confirmed but invoice not paid
    IF v_quote_status = 'confirmed' AND v_invoice_status != 'paid' THEN
      v_issues := v_issues || jsonb_build_object(
        'type', 'status_mismatch',
        'description', 'Quote marked as confirmed but invoice not paid',
        'quote_status', v_quote_status::text,
        'invoice_status', v_invoice_status::text
      );
    END IF;

    -- Quote marked as approved but invoice not in appropriate status
    IF v_quote_status = 'approved' AND v_invoice_status NOT IN ('approved', 'payment_pending', 'partially_paid', 'paid') THEN
      v_issues := v_issues || jsonb_build_object(
        'type', 'status_mismatch',
        'description', 'Quote approved but invoice in wrong status',
        'quote_status', v_quote_status::text,
        'invoice_status', v_invoice_status::text
      );
    END IF;

    -- Cancellation mismatch
    IF v_quote_status != 'cancelled' AND v_invoice_status = 'cancelled' THEN
      v_issues := v_issues || jsonb_build_object(
        'type', 'cancellation_mismatch',
        'description', 'Invoice cancelled but quote not cancelled',
        'quote_status', v_quote_status::text,
        'invoice_status', v_invoice_status::text
      );
    END IF;
  END IF;

  RETURN QUERY SELECT 
    jsonb_array_length(v_issues) = 0 as is_consistent,
    v_issues as issues;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;