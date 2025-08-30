-- Create quote_line_items table for persistent pricing data
CREATE TABLE public.quote_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0, -- stored in cents
  total_price INTEGER NOT NULL DEFAULT 0, -- stored in cents
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_step_completion table for tracking completed steps
CREATE TABLE public.workflow_step_completion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID NOT NULL,
  step_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_by TEXT NOT NULL DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_completion ENABLE ROW LEVEL SECURITY;

-- Create policies for quote_line_items
CREATE POLICY "Admin can manage quote line items" 
ON public.quote_line_items 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for workflow_step_completion
CREATE POLICY "Admin can manage workflow step completion" 
ON public.workflow_step_completion 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_line_items_updated_at
BEFORE UPDATE ON public.quote_line_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_quote_line_items_quote_id ON public.quote_line_items(quote_request_id);
CREATE INDEX idx_workflow_step_completion_quote_id ON public.workflow_step_completion(quote_request_id);
CREATE INDEX idx_workflow_step_completion_step_id ON public.workflow_step_completion(step_id);