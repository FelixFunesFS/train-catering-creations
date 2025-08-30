-- Create change requests table for customer estimate modifications
CREATE TABLE public.change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'modification', -- 'modification', 'cancellation', 'postponement'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected', 'completed'
  original_details JSONB,
  requested_changes JSONB NOT NULL,
  customer_comments TEXT,
  admin_response TEXT,
  estimated_cost_change INTEGER DEFAULT 0, -- in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

-- Allow customers to view their own change requests
CREATE POLICY "Customers can view own change requests" 
ON public.change_requests 
FOR SELECT 
USING (true); -- Public read for now, can be restricted later

-- Allow customers to create change requests
CREATE POLICY "Customers can create change requests" 
ON public.change_requests 
FOR INSERT 
WITH CHECK (true);

-- Allow admin to manage all change requests
CREATE POLICY "Admin can manage change requests" 
ON public.change_requests 
FOR ALL 
USING (true);

-- Create payment tracking table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_type TEXT NOT NULL, -- 'deposit', 'partial', 'final', 'full'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'canceled'
  payment_method TEXT, -- 'card', 'bank_transfer', 'cash', 'check'
  customer_email TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  failed_reason TEXT
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage all payment transactions
CREATE POLICY "Admin can manage payment transactions" 
ON public.payment_transactions 
FOR ALL 
USING (true);

-- Allow customers to view their own payment transactions
CREATE POLICY "Customers can view own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (true);

-- Create estimate versions table for tracking changes
CREATE TABLE public.estimate_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  change_request_id UUID REFERENCES public.change_requests(id) ON DELETE SET NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'superseded'
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'admin'
);

-- Enable RLS
ALTER TABLE public.estimate_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for estimate versions
CREATE POLICY "Public can view estimate versions" 
ON public.estimate_versions 
FOR SELECT 
USING (true);

-- Allow admin to manage estimate versions
CREATE POLICY "Admin can manage estimate versions" 
ON public.estimate_versions 
FOR ALL 
USING (true);

-- Create updated_at trigger for change_requests
CREATE TRIGGER update_change_requests_updated_at
  BEFORE UPDATE ON public.change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for payment_transactions
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();