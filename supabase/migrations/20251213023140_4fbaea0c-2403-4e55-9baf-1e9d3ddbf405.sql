-- Create comprehensive event_summary view combining quote_requests + invoices
CREATE OR REPLACE VIEW public.event_summary AS
SELECT 
  qr.id AS quote_id,
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
  qr.workflow_status AS quote_status,
  qr.created_at AS quote_created_at,
  qr.compliance_level,
  qr.requires_po_number,
  qr.po_number,
  
  -- Invoice data
  i.id AS invoice_id,
  i.invoice_number,
  i.workflow_status AS invoice_status,
  i.total_amount,
  i.subtotal,
  i.tax_amount,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.document_type,
  
  -- Calculated fields
  (qr.event_date - CURRENT_DATE) AS days_until_event,
  
  -- Payment calculations
  COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) AS total_paid,
  
  i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) AS balance_due,
  
  -- Risk indicators (use quote status for 'confirmed' check)
  CASE 
    WHEN i.workflow_status = 'overdue' THEN 'high'
    WHEN i.due_date < CURRENT_DATE AND i.workflow_status NOT IN ('paid', 'cancelled') THEN 'high'
    WHEN (qr.event_date - CURRENT_DATE) <= 7 AND i.workflow_status NOT IN ('paid') AND qr.workflow_status NOT IN ('confirmed', 'completed') THEN 'high'
    WHEN (qr.event_date - CURRENT_DATE) <= 14 AND i.workflow_status NOT IN ('paid', 'partially_paid') AND qr.workflow_status NOT IN ('confirmed', 'completed') THEN 'medium'
    ELSE 'low'
  END AS risk_level,
  
  -- Status for display
  CASE 
    WHEN i.workflow_status = 'paid' THEN 'paid'
    WHEN i.workflow_status = 'partially_paid' THEN 'partially_paid'
    WHEN i.workflow_status = 'overdue' THEN 'overdue'
    WHEN i.due_date < CURRENT_DATE AND i.workflow_status NOT IN ('paid', 'cancelled') THEN 'overdue'
    WHEN i.workflow_status IN ('sent', 'viewed', 'approved') THEN 'pending'
    WHEN qr.workflow_status = 'confirmed' THEN 'confirmed'
    WHEN qr.workflow_status = 'completed' THEN 'completed'
    WHEN qr.workflow_status = 'cancelled' THEN 'cancelled'
    ELSE 'draft'
  END AS payment_status

FROM quote_requests qr
LEFT JOIN invoices i ON i.quote_request_id = qr.id AND i.is_draft = false;

COMMENT ON VIEW public.event_summary IS 'Consolidated view of events with payment status, used by Dashboard, Pipeline, Calendar, At-Risk panels';

-- Enhance invoice_payment_summary with milestone data
DROP VIEW IF EXISTS public.invoice_payment_summary;

CREATE VIEW public.invoice_payment_summary AS
SELECT 
  i.id AS invoice_id,
  i.invoice_number,
  i.total_amount,
  i.subtotal,
  i.tax_amount,
  i.due_date,
  i.workflow_status,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.last_reminder_sent_at,
  i.reminder_count,
  i.created_at AS invoice_created_at,
  
  -- Quote/Customer data
  qr.id AS quote_id,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.event_name,
  qr.event_date,
  qr.location,
  qr.guest_count,
  qr.event_type,
  qr.service_type,
  qr.compliance_level,
  qr.requires_po_number,
  
  -- Payment calculations
  COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) AS total_paid,
  
  i.total_amount - COALESCE(
    (SELECT SUM(amount) FROM payment_transactions pt 
     WHERE pt.invoice_id = i.id AND pt.status = 'completed'), 0
  ) AS balance_remaining,
  
  -- Overdue calculation
  CASE 
    WHEN i.due_date IS NULL THEN 0
    WHEN i.workflow_status IN ('paid', 'cancelled') THEN 0
    ELSE GREATEST(0, CURRENT_DATE - i.due_date)
  END AS days_overdue,
  
  -- Milestone summary (JSON)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
      'id', pm.id,
      'milestone_type', pm.milestone_type,
      'amount_cents', pm.amount_cents,
      'percentage', pm.percentage,
      'due_date', pm.due_date,
      'status', pm.status
    ) ORDER BY pm.due_date)
    FROM payment_milestones pm WHERE pm.invoice_id = i.id),
    '[]'::jsonb
  ) AS milestones

FROM invoices i
LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
WHERE i.is_draft = false;

COMMENT ON VIEW public.invoice_payment_summary IS 'Invoice payment summary with customer data and milestone breakdown for AR dashboard';