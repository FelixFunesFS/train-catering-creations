-- Add theme_colors column to quote_requests table
ALTER TABLE public.quote_requests 
ADD COLUMN theme_colors text;