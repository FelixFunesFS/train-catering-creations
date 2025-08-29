-- Add title column to invoice_line_items table
ALTER TABLE public.invoice_line_items 
ADD COLUMN title TEXT;