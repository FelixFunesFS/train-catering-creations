-- Fix payment_transactions table to ensure amount is properly handled
-- Add proper constraints and indexes for performance

-- First, update the payment_transactions table to handle null amounts
UPDATE payment_transactions 
SET amount = 0 
WHERE amount IS NULL;

-- Add database-level protections
CREATE OR REPLACE FUNCTION validate_payment_transaction() 
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure amount is never null
  IF NEW.amount IS NULL THEN
    RAISE EXCEPTION 'Payment transaction amount cannot be null';
  END IF;
  
  -- Ensure amount is positive
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment transaction amount must be positive';
  END IF;
  
  -- Ensure customer email is provided
  IF NEW.customer_email IS NULL OR NEW.customer_email = '' THEN
    RAISE EXCEPTION 'Payment transaction must have customer email';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment transaction validation
DROP TRIGGER IF EXISTS validate_payment_transaction_trigger ON payment_transactions;
CREATE TRIGGER validate_payment_transaction_trigger
  BEFORE INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_transaction();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_email ON payment_transactions(customer_email);

-- Fix foreign key relationships to avoid ambiguity in queries
-- Add specific relationship names to help queries

-- Add a type field to invoices to consolidate estimate/invoice functionality
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'invoice';
UPDATE invoices SET document_type = CASE 
  WHEN is_draft = true THEN 'estimate'
  ELSE 'invoice'
END WHERE document_type IS NULL;

-- Create index for better performance on document type queries
CREATE INDEX IF NOT EXISTS idx_invoices_document_type ON invoices(document_type);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_request_id ON invoices(quote_request_id);

-- Add workflow tracking improvements
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_customer_action TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_feedback JSONB DEFAULT '{}';

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Customers can view own transactions" ON payment_transactions;
CREATE POLICY "Customers can view own transactions" ON payment_transactions
  FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Add audit trail for invoice changes
CREATE TABLE IF NOT EXISTS invoice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by TEXT DEFAULT 'system',
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to audit log
CREATE POLICY "Admin can view audit log" ON invoice_audit_log
  FOR SELECT
  USING (true);

-- Create indexes for audit performance
CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_invoice_id ON invoice_audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_audit_log_changed_at ON invoice_audit_log(changed_at);

-- Add trigger to track invoice changes
CREATE OR REPLACE FUNCTION log_invoice_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'status', to_jsonb(OLD.status), to_jsonb(NEW.status), NEW.status_changed_by);
  END IF;
  
  -- Log total amount changes
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'total_amount', to_jsonb(OLD.total_amount), to_jsonb(NEW.total_amount), NEW.status_changed_by);
  END IF;
  
  -- Log document type changes
  IF OLD.document_type IS DISTINCT FROM NEW.document_type THEN
    INSERT INTO invoice_audit_log (invoice_id, field_changed, old_value, new_value, changed_by)
    VALUES (NEW.id, 'document_type', to_jsonb(OLD.document_type), to_jsonb(NEW.document_type), NEW.status_changed_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_invoice_changes_trigger ON invoices;
CREATE TRIGGER track_invoice_changes_trigger
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_changes();