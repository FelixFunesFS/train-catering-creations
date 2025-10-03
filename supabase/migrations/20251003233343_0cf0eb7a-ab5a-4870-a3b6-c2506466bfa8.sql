-- Create event timeline tasks table for tracking pre-event, day-of, and post-event checklist items
CREATE TABLE IF NOT EXISTS public.event_timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('pre_event', 'day_of', 'post_event')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_timeline_tasks ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admin full access to event timeline tasks"
ON public.event_timeline_tasks
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add contract tracking fields to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id),
ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_event_timeline_tasks_quote_request_id 
ON public.event_timeline_tasks(quote_request_id);

CREATE INDEX IF NOT EXISTS idx_event_timeline_tasks_due_date 
ON public.event_timeline_tasks(due_date) WHERE completed = false;