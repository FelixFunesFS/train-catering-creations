-- Phase 5: Create workflow_state table for persistence
CREATE TABLE IF NOT EXISTS public.workflow_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id uuid REFERENCES public.quote_requests(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_step text NOT NULL,
  step_data jsonb DEFAULT '{}'::jsonb,
  completed_steps text[] DEFAULT ARRAY[]::text[],
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_by text DEFAULT 'admin'::text
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_state_quote_request ON public.workflow_state(quote_request_id);

-- Add metadata tracking to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS customer_signature_data jsonb DEFAULT NULL;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS viewed_at timestamptz DEFAULT NULL;

-- Add customer portal access tracking to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS portal_last_accessed timestamptz DEFAULT NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS portal_access_count integer DEFAULT 0;

-- Add template tracking to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS template_used text DEFAULT NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS template_metadata jsonb DEFAULT '{}'::jsonb;

-- Enhance payment milestones with payment link tracking
ALTER TABLE public.payment_milestones ADD COLUMN IF NOT EXISTS payment_link_sent_at timestamptz DEFAULT NULL;
ALTER TABLE public.payment_milestones ADD COLUMN IF NOT EXISTS payment_link_opened_at timestamptz DEFAULT NULL;

-- Add event timeline task recalculation tracking
ALTER TABLE public.event_timeline_tasks ADD COLUMN IF NOT EXISTS is_date_dependent boolean DEFAULT true;
ALTER TABLE public.event_timeline_tasks ADD COLUMN IF NOT EXISTS days_before_event integer DEFAULT NULL;

COMMENT ON TABLE public.workflow_state IS 'Tracks the current state and progress of quotes through the workflow';
COMMENT ON COLUMN public.workflow_state.step_data IS 'Stores step-specific data like selections, notes, etc';
COMMENT ON COLUMN public.workflow_state.completed_steps IS 'Array of completed step names for progress tracking';