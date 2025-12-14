-- Drop and recreate invoice_payment_summary view to include vegetarian_entrees
DROP VIEW IF EXISTS invoice_payment_summary;

CREATE VIEW invoice_payment_summary AS
SELECT i.id AS invoice_id,
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
    qr.vegetarian_entrees,
    COALESCE(( SELECT sum(pt.amount) AS sum
           FROM payment_transactions pt
          WHERE pt.invoice_id = i.id AND pt.status = 'completed'::text), 0::bigint) AS total_paid,
    i.total_amount - COALESCE(( SELECT sum(pt.amount) AS sum
           FROM payment_transactions pt
          WHERE pt.invoice_id = i.id AND pt.status = 'completed'::text), 0::bigint) AS balance_remaining,
        CASE
            WHEN i.due_date IS NULL THEN 0
            WHEN i.workflow_status = ANY (ARRAY['paid'::invoice_workflow_status, 'cancelled'::invoice_workflow_status]) THEN 0
            ELSE GREATEST(0, CURRENT_DATE - i.due_date)
        END AS days_overdue,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('id', pm.id, 'milestone_type', pm.milestone_type, 'amount_cents', pm.amount_cents, 'percentage', pm.percentage, 'due_date', pm.due_date, 'status', pm.status) ORDER BY pm.due_date) AS jsonb_agg
           FROM payment_milestones pm
          WHERE pm.invoice_id = i.id), '[]'::jsonb) AS milestones
   FROM invoices i
     LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id;