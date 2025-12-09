-- Create view for unified payment tracking with AR aging
CREATE OR REPLACE VIEW invoice_payment_summary AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.total_amount,
  i.due_date,
  i.workflow_status,
  i.last_reminder_sent_at,
  i.reminder_count,
  i.created_at as invoice_created_at,
  COALESCE(SUM(pt.amount) FILTER (WHERE pt.status = 'completed'), 0) as total_paid,
  i.total_amount - COALESCE(SUM(pt.amount) FILTER (WHERE pt.status = 'completed'), 0) as balance_remaining,
  CASE 
    WHEN i.due_date IS NULL THEN 0
    WHEN i.workflow_status IN ('paid', 'cancelled') THEN 0
    ELSE GREATEST(0, (CURRENT_DATE - i.due_date))
  END as days_overdue,
  qr.id as quote_id,
  qr.contact_name,
  qr.email,
  qr.phone,
  qr.event_name,
  qr.event_date
FROM invoices i
LEFT JOIN payment_transactions pt ON pt.invoice_id = i.id
LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
GROUP BY i.id, qr.id;