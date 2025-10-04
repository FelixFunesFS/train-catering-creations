-- Clear all customer request data for fresh workflow testing
-- This preserves configuration data (pricing_rules, email_templates, business_config, user_roles)

-- Step 1: Clear analytics and tracking data
DELETE FROM analytics_events;
DELETE FROM workflow_state_log;
DELETE FROM quote_request_history;
DELETE FROM invoice_audit_log;
DELETE FROM reminder_logs;
DELETE FROM payment_history;
DELETE FROM payment_schedule_audit;

-- Step 2: Clear customer interaction data
DELETE FROM messages;
DELETE FROM message_threads;
DELETE FROM change_requests;

-- Step 3: Clear financial data (respecting foreign key order)
DELETE FROM payment_transactions;
DELETE FROM payment_milestones;
DELETE FROM invoice_line_items;
DELETE FROM invoice_line_items_archive;
DELETE FROM estimate_versions;
DELETE FROM contracts;
DELETE FROM invoices;

-- Step 4: Clear event management data
DELETE FROM event_timeline_tasks;
DELETE FROM calendar_events;

-- Step 5: Clear base customer data
DELETE FROM quote_line_items;
DELETE FROM government_contracts;
DELETE FROM quote_requests;
DELETE FROM customers;