-- Add payment scheduling and enhanced workflow support
-- Add customer type to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'PERSON' CHECK (customer_type IN ('PERSON', 'ORG', 'GOV'));

-- Add payment schedule information to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_schedule_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS is_milestone_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_order INTEGER DEFAULT 1;

-- Create payment milestones table for tracking scheduled payments
CREATE TABLE IF NOT EXISTS public.payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('DEPOSIT', 'MILESTONE', 'BALANCE', 'FULL', 'COMBINED', 'FINAL')),
  percentage NUMERIC(5,2) NOT NULL,
  amount_cents INTEGER NOT NULL,
  due_date DATE,
  is_due_now BOOLEAN DEFAULT false,
  is_net30 BOOLEAN DEFAULT false,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on payment_milestones
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to payment milestones
CREATE POLICY "Admin can manage payment milestones" 
ON public.payment_milestones 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_milestones_invoice_id ON public.payment_milestones(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_due_date ON public.payment_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_status ON public.payment_milestones(status);

-- Add trigger for updating payment milestones updated_at
CREATE TRIGGER update_payment_milestones_updated_at
    BEFORE UPDATE ON public.payment_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add government contract workflow support
ALTER TABLE public.quote_requests 
ADD COLUMN IF NOT EXISTS requires_po_number BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_number TEXT,
ADD COLUMN IF NOT EXISTS compliance_level TEXT DEFAULT 'standard' CHECK (compliance_level IN ('standard', 'government', 'enterprise'));

-- Update invoice_status enum values to include new statuses
-- Note: We're using text instead of enum for flexibility
COMMENT ON COLUMN public.quote_requests.invoice_status IS 'Possible values: pending, draft, payment_scheduled, gov_net30, sent, paid, overdue';

-- Create audit trail for payment schedule changes
CREATE TABLE IF NOT EXISTS public.payment_schedule_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  old_schedule JSONB,
  new_schedule JSONB,
  changed_by TEXT DEFAULT 'system',
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on payment schedule audit
ALTER TABLE public.payment_schedule_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to audit logs
CREATE POLICY "Admin can view payment schedule audit" 
ON public.payment_schedule_audit 
FOR SELECT 
USING (true);