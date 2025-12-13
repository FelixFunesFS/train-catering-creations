-- Add email_opened_at column to track when customers open emails
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN invoices.email_opened_at IS 'Timestamp when customer first opened an email containing the estimate/invoice link';