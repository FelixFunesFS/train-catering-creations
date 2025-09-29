-- Enable RLS on remaining tables that are causing security warnings

-- Check which tables still need RLS by enabling it on all remaining tables
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_state_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_completion ENABLE ROW LEVEL SECURITY;