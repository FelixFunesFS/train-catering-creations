-- Phase 5: Database Cleanup & Optimization
-- Remove unused fields and consolidate status tracking

-- 1. Clean up invoices table - remove redundant fields
ALTER TABLE invoices DROP COLUMN IF EXISTS draft_data;
ALTER TABLE invoices DROP COLUMN IF EXISTS manual_overrides;
ALTER TABLE invoices DROP COLUMN IF EXISTS template_metadata;
ALTER TABLE invoices DROP COLUMN IF EXISTS template_used;
ALTER TABLE invoices DROP COLUMN IF EXISTS override_reason;
ALTER TABLE invoices DROP COLUMN IF EXISTS quote_version;
ALTER TABLE invoices DROP COLUMN IF EXISTS original_quote_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS last_quote_sync;

-- 2. Clean up quote_requests table - remove unused fields
ALTER TABLE quote_requests DROP COLUMN IF EXISTS calendar_event_id;
ALTER TABLE quote_requests DROP COLUMN IF EXISTS calendar_sync_status;
ALTER TABLE quote_requests DROP COLUMN IF EXISTS last_calendar_sync;
ALTER TABLE quote_requests DROP COLUMN IF EXISTS theme_colors;

-- 3. Remove workflow_state table (replaced by unified_workflow_status view)
DROP TABLE IF EXISTS workflow_state CASCADE;

-- 4. Consolidate payment tracking - remove duplicate fields from invoices
ALTER TABLE invoices DROP COLUMN IF EXISTS email_opened_at;
ALTER TABLE invoices DROP COLUMN IF EXISTS email_opened_count;
ALTER TABLE invoices DROP COLUMN IF EXISTS estimate_viewed_at;
ALTER TABLE invoices DROP COLUMN IF EXISTS estimate_viewed_count;
ALTER TABLE invoices DROP COLUMN IF EXISTS portal_last_accessed;
ALTER TABLE invoices DROP COLUMN IF EXISTS portal_access_count;
ALTER TABLE invoices DROP COLUMN IF EXISTS last_customer_action;
ALTER TABLE invoices DROP COLUMN IF EXISTS customer_feedback;

-- 5. Optimize quote_requests - remove redundant customer interaction tracking
ALTER TABLE quote_requests DROP COLUMN IF EXISTS last_customer_interaction;

-- 6. Add index for improved workflow status queries
CREATE INDEX IF NOT EXISTS idx_quotes_workflow_status ON quote_requests(workflow_status);
CREATE INDEX IF NOT EXISTS idx_invoices_workflow_status ON invoices(workflow_status);
CREATE INDEX IF NOT EXISTS idx_workflow_log_entity ON workflow_state_log(entity_type, entity_id);

-- 7. Add index for commonly queried relationships
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);

-- 8. Optimize RLS policies by adding helper function
CREATE OR REPLACE FUNCTION is_quote_owner(quote_id uuid, user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quote_requests
    WHERE id = quote_id AND email = user_email
  );
$$;

-- 9. Add helpful comments documenting the consolidated workflow approach
COMMENT ON COLUMN invoices.workflow_status IS 
  'Primary status field. Automatically syncs to quote_requests.workflow_status via trigger.';

COMMENT ON COLUMN quote_requests.workflow_status IS 
  'Primary status field. Synced from invoice status changes via database trigger.';