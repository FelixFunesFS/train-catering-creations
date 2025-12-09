-- Add last reminder tracking columns
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Add milestone_id to payment_transactions for tracking which milestone was paid
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES payment_milestones(id);

-- Add index for faster AR queries
CREATE INDEX IF NOT EXISTS idx_invoices_due_date_status 
ON invoices(due_date) 
WHERE workflow_status NOT IN ('paid', 'cancelled', 'draft');