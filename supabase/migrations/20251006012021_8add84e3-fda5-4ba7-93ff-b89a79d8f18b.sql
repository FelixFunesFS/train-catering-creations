-- Phase 1: Remove deprecated status columns and consolidate to workflow_status only

-- Drop old status column from quote_requests (workflow_status is the new standard)
ALTER TABLE quote_requests DROP COLUMN IF EXISTS status;

-- Drop old status column from invoices if it exists (workflow_status is the standard)
-- Note: invoices table already uses workflow_status correctly

-- Drop old status column from contracts if it exists
-- Note: contracts.status is still used, we'll keep it for now as it has specific contract states

-- Update change_requests to use workflow_status instead of status
-- First, migrate existing data if status column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'change_requests' AND column_name = 'status'
  ) THEN
    -- Add workflow_status column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'change_requests' AND column_name = 'workflow_status'
    ) THEN
      ALTER TABLE change_requests 
      ADD COLUMN workflow_status text NOT NULL DEFAULT 'pending';
    END IF;
    
    -- Copy status to workflow_status
    UPDATE change_requests 
    SET workflow_status = status 
    WHERE workflow_status IS NULL OR workflow_status = '';
    
    -- Drop old status column
    ALTER TABLE change_requests DROP COLUMN status;
  END IF;
END $$;

-- Update payment_milestones.status to be more specific (keep this as it's milestone-specific)
-- This is fine - milestones have their own lifecycle independent of invoices

-- Add indexes for workflow_status columns for better query performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_workflow_status 
ON quote_requests(workflow_status);

CREATE INDEX IF NOT EXISTS idx_invoices_workflow_status 
ON invoices(workflow_status);

CREATE INDEX IF NOT EXISTS idx_change_requests_workflow_status 
ON change_requests(workflow_status) 
WHERE workflow_status IS NOT NULL;

-- Update workflow_state_log to ensure it tracks workflow_status changes
COMMENT ON TABLE workflow_state_log IS 
'Tracks all workflow_status changes across entities. Status field has been deprecated in favor of workflow_status.';

-- Update business_config if there are any status-related configurations
UPDATE business_config 
SET config_value = jsonb_set(
  config_value,
  '{migration_notes}',
  to_jsonb('Phase 1 Complete: Consolidated to workflow_status only'::text)
)
WHERE config_key = 'system_metadata';
