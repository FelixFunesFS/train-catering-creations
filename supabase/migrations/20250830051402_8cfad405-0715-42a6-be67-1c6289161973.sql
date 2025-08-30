-- Phase 2: Fix Data Model & Workflow Issues
-- Add proper status tracking and fix quote-to-invoice progression

-- First, let's add proper foreign key relationships and status tracking
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS quote_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS original_quote_id UUID REFERENCES quote_requests(id);

-- Create proper enum types for better status management
DO $$ BEGIN
    CREATE TYPE quote_workflow_status AS ENUM (
        'pending',
        'under_review', 
        'estimated',
        'quoted',
        'approved',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_workflow_status AS ENUM (
        'draft',
        'pending_review',
        'sent',
        'viewed',
        'approved',
        'paid',
        'overdue',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add workflow tracking columns
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS workflow_status quote_workflow_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS status_changed_by TEXT DEFAULT 'system';

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS workflow_status invoice_workflow_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS status_changed_by TEXT DEFAULT 'system';

-- Create workflow state tracking table
CREATE TABLE IF NOT EXISTS workflow_state_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'quote' or 'invoice'
    entity_id UUID NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT DEFAULT 'system',
    change_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for workflow log
ALTER TABLE workflow_state_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage workflow logs" ON workflow_state_log
FOR ALL USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_workflow_status ON quote_requests(workflow_status);
CREATE INDEX IF NOT EXISTS idx_invoice_workflow_status ON invoices(workflow_status);
CREATE INDEX IF NOT EXISTS idx_workflow_log_entity ON workflow_state_log(entity_type, entity_id);

-- Create function to prevent duplicate invoices for the same quote
CREATE OR REPLACE FUNCTION prevent_duplicate_invoices()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's already a non-draft invoice for this quote
    IF EXISTS (
        SELECT 1 FROM invoices 
        WHERE quote_request_id = NEW.quote_request_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND NOT is_draft
    ) THEN
        RAISE EXCEPTION 'An invoice already exists for this quote. Update the existing invoice instead.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate invoices
DROP TRIGGER IF EXISTS prevent_duplicate_invoices_trigger ON invoices;
CREATE TRIGGER prevent_duplicate_invoices_trigger
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_invoices();

-- Create function to auto-update workflow status
CREATE OR REPLACE FUNCTION update_workflow_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the status change
    INSERT INTO workflow_state_log (
        entity_type,
        entity_id,
        previous_status,
        new_status,
        changed_by,
        change_reason
    ) VALUES (
        TG_TABLE_NAME::text,
        NEW.id,
        COALESCE(OLD.workflow_status::text, OLD.status::text),
        COALESCE(NEW.workflow_status::text, NEW.status::text),
        NEW.status_changed_by,
        'Status updated via ' || TG_OP
    );
    
    -- Update timestamp
    NEW.last_status_change = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for status tracking
DROP TRIGGER IF EXISTS update_quote_workflow_status ON quote_requests;
CREATE TRIGGER update_quote_workflow_status
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    WHEN (OLD.workflow_status IS DISTINCT FROM NEW.workflow_status OR OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_workflow_status();

DROP TRIGGER IF EXISTS update_invoice_workflow_status ON invoices;
CREATE TRIGGER update_invoice_workflow_status
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    WHEN (OLD.workflow_status IS DISTINCT FROM NEW.workflow_status OR OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_workflow_status();