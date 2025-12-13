-- Add guest_count_with_restrictions and special_requests to invoice_payment_summary view
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
  qr.guest_count_with_restrictions,
  qr.special_requests,
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
LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id;

COMMENT ON VIEW public.invoice_payment_summary IS 'Invoice payment summary with vegetarian portions and special requests for estimate editing';