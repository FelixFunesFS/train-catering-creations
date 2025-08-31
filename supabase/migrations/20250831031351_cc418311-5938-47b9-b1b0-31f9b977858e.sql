-- Clear database tables for clean testing
-- Remove all invoices and related data
DELETE FROM invoice_line_items;
DELETE FROM invoices;

-- Clear quote request related data
DELETE FROM quote_line_items;
DELETE FROM quote_request_history;
DELETE FROM workflow_state_log;

-- Clear payment and transaction data
DELETE FROM payment_history;
DELETE FROM payment_transactions;

-- Clear communication data
DELETE FROM messages;
DELETE FROM message_threads;
DELETE FROM reminder_logs;

-- Clear change requests and estimates
DELETE FROM change_requests;
DELETE FROM estimate_versions;

-- Clear contracts
DELETE FROM contracts;

-- Reset quote requests to clean state (optional - keeps form submissions but clears status)
UPDATE quote_requests SET 
  status = 'pending',
  workflow_status = 'pending',
  estimated_total = 0,
  final_total = 0,
  invoice_status = 'pending',
  last_status_change = now(),
  status_changed_by = 'system'
WHERE id IS NOT NULL;

-- Keep pricing_rules, email_templates, business_config, customers, gmail_tokens, 
-- calendar_events, admin_notes, automated_workflows, government_contracts