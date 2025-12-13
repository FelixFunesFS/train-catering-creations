-- Phase 2: Database Table Cleanup

-- 1. Drop unused tables (contract-related, already removed from code)
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS government_contracts CASCADE;
DROP TABLE IF EXISTS automated_workflows CASCADE;

-- 2. Remove contract-related columns from invoices table
ALTER TABLE invoices DROP COLUMN IF EXISTS contract_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS contract_signed_at;
ALTER TABLE invoices DROP COLUMN IF EXISTS requires_separate_contract;

-- 3. Add performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_workflow_status ON invoices(workflow_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_request_id ON invoices(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_event_date ON quote_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_quote_requests_workflow_status ON quote_requests(workflow_status);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_invoice_id ON payment_milestones(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- 4. Add comments to archive/deprecated tables for documentation
COMMENT ON TABLE calendar_events IS 'ARCHIVED: Calendar sync feature not active - kept for future use';
COMMENT ON TABLE estimate_versions IS 'ARCHIVED: Version tracking not fully implemented - kept for future use';
COMMENT ON TABLE message_threads IS 'ARCHIVED: Messaging feature not active - kept for future use';
COMMENT ON TABLE messages IS 'ARCHIVED: Messaging feature not active - kept for future use';
COMMENT ON TABLE payment_history IS 'DEPRECATED: Use payment_transactions instead';
COMMENT ON TABLE quote_line_items IS 'DEPRECATED: Use invoice_line_items instead';