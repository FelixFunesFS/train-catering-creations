-- TEMPORARY: Disable RLS on invoice-related tables for development
-- This allows invoice generation workflow to function without authentication
-- TODO: Re-enable RLS when authentication is implemented

-- Disable RLS on invoices table
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- Disable RLS on invoice_line_items table  
ALTER TABLE public.invoice_line_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customers table (needed for invoice generation)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;