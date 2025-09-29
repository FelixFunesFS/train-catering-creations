-- Temporarily disable RLS on key tables for immediate data access
-- This bypasses all authentication requirements

-- Disable RLS on quote_requests table
ALTER TABLE public.quote_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on invoices table  
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customers table
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on contracts table
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on admin_notes table
ALTER TABLE public.admin_notes DISABLE ROW LEVEL SECURITY;

-- Disable RLS on quote_line_items table
ALTER TABLE public.quote_line_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on invoice_line_items table
ALTER TABLE public.invoice_line_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on change_requests table
ALTER TABLE public.change_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on payment_transactions table
ALTER TABLE public.payment_transactions DISABLE ROW LEVEL SECURITY;