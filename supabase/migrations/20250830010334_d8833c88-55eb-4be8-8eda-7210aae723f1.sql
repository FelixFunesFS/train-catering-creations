-- Create contracts table for automated contract generation
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'standard',
  contract_html TEXT,
  status TEXT NOT NULL DEFAULT 'generated',
  generated_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create government_contracts table for special government contract handling
CREATE TABLE public.government_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  contract_status TEXT NOT NULL DEFAULT 'initiated',
  compliance_checklist JSONB DEFAULT '{}',
  compliance_documentation JSONB DEFAULT '{}',
  required_documents TEXT[],
  special_requirements JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reminder_logs table for tracking automated reminders
CREATE TABLE public.reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create calendar_events table for calendar integration
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  calendar_provider TEXT NOT NULL DEFAULT 'google',
  external_event_id TEXT,
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  sync_status TEXT DEFAULT 'pending',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contracts
CREATE POLICY "Admin can manage contracts" ON public.contracts
  FOR ALL USING (true);

-- Create RLS policies for government_contracts
CREATE POLICY "Admin can manage government contracts" ON public.government_contracts
  FOR ALL USING (true);

-- Create RLS policies for reminder_logs
CREATE POLICY "Admin can view reminder logs" ON public.reminder_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert reminder logs" ON public.reminder_logs
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for calendar_events
CREATE POLICY "Admin can manage calendar events" ON public.calendar_events
  FOR ALL USING (true);

-- Add indexes for better performance
CREATE INDEX idx_contracts_invoice_id ON public.contracts(invoice_id);
CREATE INDEX idx_government_contracts_quote_id ON public.government_contracts(quote_request_id);
CREATE INDEX idx_reminder_logs_invoice_id ON public.reminder_logs(invoice_id);
CREATE INDEX idx_reminder_logs_sent_at ON public.reminder_logs(sent_at);
CREATE INDEX idx_calendar_events_quote_id ON public.calendar_events(quote_request_id);
CREATE INDEX idx_calendar_events_event_date ON public.calendar_events(event_date);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_government_contracts_updated_at
  BEFORE UPDATE ON public.government_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();