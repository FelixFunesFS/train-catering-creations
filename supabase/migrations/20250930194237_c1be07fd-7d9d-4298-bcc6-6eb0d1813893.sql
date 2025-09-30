-- Disable RLS on all tables for development
-- NOTE: Re-enable RLS before production deployment

-- Core tables
ALTER TABLE public.change_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_versions DISABLE ROW LEVEL SECURITY;

-- Supporting tables
ALTER TABLE public.payment_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Workflow and audit tables
ALTER TABLE public.workflow_state_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_completion DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_request_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedule_audit DISABLE ROW LEVEL SECURITY;

-- Communication tables
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs DISABLE ROW LEVEL SECURITY;

-- Configuration tables
ALTER TABLE public.business_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;

-- Contract and compliance tables
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_workflows DISABLE ROW LEVEL SECURITY;

-- Analytics and archive tables
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items_archive DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items DISABLE ROW LEVEL SECURITY;

-- Auth tables (keep user_roles and gmail_tokens as they have specific security requirements)
-- ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.gmail_tokens DISABLE ROW LEVEL SECURITY;