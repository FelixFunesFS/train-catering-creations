-- Create customers table for Stripe integration
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table for comprehensive tracking
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  due_date DATE,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoice line items for detailed breakdown
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT, -- 'protein', 'appetizer', 'side', 'service', 'equipment', etc.
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_method TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing rules table for configurable pricing
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'protein', 'appetizer', 'side', 'service', 'equipment'
  item_name TEXT NOT NULL,
  base_price INTEGER NOT NULL, -- in cents
  price_per_person INTEGER DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 1,
  service_type TEXT, -- 'buffet', 'plated', 'family_style'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add invoice tracking fields to quote_requests
ALTER TABLE public.quote_requests 
ADD COLUMN invoice_status TEXT DEFAULT 'pending',
ADD COLUMN estimated_total INTEGER DEFAULT 0,
ADD COLUMN final_total INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can manage customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Admin can manage invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Admin can manage invoice line items" ON public.invoice_line_items FOR ALL USING (true);
CREATE POLICY "Admin can manage payment history" ON public.payment_history FOR ALL USING (true);
CREATE POLICY "Admin can manage pricing rules" ON public.pricing_rules FOR ALL USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing rules
INSERT INTO public.pricing_rules (category, item_name, base_price, price_per_person, service_type) VALUES
('protein', 'Fried Chicken', 0, 1200, 'buffet'),
('protein', 'Pulled Pork', 0, 1100, 'buffet'),
('protein', 'Beef Brisket', 0, 1400, 'buffet'),
('side', 'Mac and Cheese', 0, 400, 'buffet'),
('side', 'Collard Greens', 0, 350, 'buffet'),
('side', 'Cornbread', 0, 200, 'buffet'),
('service', 'Buffet Service', 15000, 0, 'buffet'),
('service', 'Plated Service', 25000, 500, 'plated'),
('equipment', 'Chafer Rental', 2500, 0, null),
('equipment', 'Linen Rental', 1500, 0, null),
('equipment', 'Table Rental', 1000, 0, null);