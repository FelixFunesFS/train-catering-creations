-- Clean all invoices and related data for fresh regeneration with consolidated supplies

-- Delete in order to respect foreign key relationships
DELETE FROM invoice_line_items;
DELETE FROM payment_milestones;
DELETE FROM payment_transactions;
DELETE FROM estimate_versions;
DELETE FROM invoice_audit_log;
DELETE FROM payment_schedule_audit;
DELETE FROM invoices;

-- Reset quote statuses to allow re-generation
UPDATE quote_requests SET workflow_status = 'pending', estimated_total = 0;