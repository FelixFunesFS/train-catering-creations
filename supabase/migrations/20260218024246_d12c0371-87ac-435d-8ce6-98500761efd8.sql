-- One-time fix: Restore INV-2026-0207 to approved status (was regressed by resend bug)
UPDATE invoices SET workflow_status = 'approved', status_changed_by = 'admin_fix'
WHERE invoice_number = 'INV-2026-0207';

UPDATE quote_requests SET workflow_status = 'approved', status_changed_by = 'admin_fix'
WHERE id = (SELECT quote_request_id FROM invoices WHERE invoice_number = 'INV-2026-0207');