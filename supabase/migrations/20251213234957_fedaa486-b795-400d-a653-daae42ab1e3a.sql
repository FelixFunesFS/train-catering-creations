-- Add vegetarian_entrees column to store selected vegetarian entrée options
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS vegetarian_entrees JSONB DEFAULT '[]'::jsonb;