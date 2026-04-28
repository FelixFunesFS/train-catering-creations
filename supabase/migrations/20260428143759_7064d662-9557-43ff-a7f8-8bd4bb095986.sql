ALTER TABLE public.reminder_logs ADD COLUMN IF NOT EXISTS quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reminder_logs_quote_request_id ON public.reminder_logs(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_type_quote_sent ON public.reminder_logs(reminder_type, quote_request_id, sent_at);