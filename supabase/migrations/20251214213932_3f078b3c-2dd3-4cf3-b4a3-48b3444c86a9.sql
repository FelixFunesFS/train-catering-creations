-- =====================================================
-- ENABLE RLS ON ALL TABLES (policies already exist)
-- =====================================================
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedule_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_state_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_completion ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIX SECURITY DEFINER VIEWS - Recreate with SECURITY INVOKER
-- =====================================================

DROP VIEW IF EXISTS event_summary;
CREATE VIEW event_summary WITH (security_invoker = true) AS
SELECT 
  qr.id as quote_id,
  qr.event_name,
  qr.event_date,
  qr.start_time,
  qr.contact_name,
  qr.email,
  qr.phone,
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
  i.subtotal,
  i.tax_amount,
  i.total_amount,
  i.workflow_status as invoice_status,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.document_type,
  COALESCE((
    SELECT SUM(pt.amount) 
    FROM payment_transactions pt 
    WHERE pt.invoice_id = i.id AND pt.status = 'completed'
  ), 0) as total_paid,
  i.total_amount - COALESCE((
    SELECT SUM(pt.amount) 
    FROM payment_transactions pt 
    WHERE pt.invoice_id = i.id AND pt.status = 'completed'
  ), 0) as balance_due,
  CASE 
    WHEN i.paid_at IS NOT NULL THEN 'paid'
    WHEN i.due_date < CURRENT_DATE THEN 'overdue'
    WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'current'
  END as payment_status,
  (qr.event_date - CURRENT_DATE) as days_until_event,
  CASE
    WHEN (qr.event_date - CURRENT_DATE) <= 7 THEN 'high'
    WHEN (qr.event_date - CURRENT_DATE) <= 14 THEN 'medium'
    ELSE 'low'
  END as risk_level
FROM quote_requests qr
LEFT JOIN invoices i ON i.quote_request_id = qr.id AND i.is_draft = false;

DROP VIEW IF EXISTS invoice_payment_summary;
CREATE VIEW invoice_payment_summary WITH (security_invoker = true) AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.subtotal,
  i.tax_amount,
  i.total_amount,
  i.workflow_status,
  i.due_date,
  i.sent_at,
  i.viewed_at,
  i.paid_at,
  i.reminder_count,
  i.last_reminder_sent_at,
  i.created_at as invoice_created_at,
  qr.id as quote_id,
  qr.event_name,
  qr.event_date,
  qr.event_type,
  qr.service_type,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.location,
  qr.guest_count,
  qr.guest_count_with_restrictions,
  qr.special_requests,
  qr.vegetarian_entrees,
  qr.compliance_level,
  qr.requires_po_number,
  COALESCE((
    SELECT SUM(pt.amount) 
    FROM payment_transactions pt 
    WHERE pt.invoice_id = i.id AND pt.status = 'completed'
  ), 0) as total_paid,
  i.total_amount - COALESCE((
    SELECT SUM(pt.amount) 
    FROM payment_transactions pt 
    WHERE pt.invoice_id = i.id AND pt.status = 'completed'
  ), 0) as balance_remaining,
  CASE 
    WHEN i.due_date IS NULL THEN 0
    WHEN i.due_date >= CURRENT_DATE THEN 0
    ELSE (CURRENT_DATE - i.due_date)
  END as days_overdue,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'id', pm.id,
      'milestone_type', pm.milestone_type,
      'percentage', pm.percentage,
      'amount_cents', pm.amount_cents,
      'due_date', pm.due_date,
      'status', pm.status,
      'is_due_now', pm.is_due_now
    ) ORDER BY pm.due_date)
    FROM payment_milestones pm 
    WHERE pm.invoice_id = i.id
  ) as milestones
FROM invoices i
LEFT JOIN quote_requests qr ON qr.id = i.quote_request_id
WHERE i.is_draft = false;