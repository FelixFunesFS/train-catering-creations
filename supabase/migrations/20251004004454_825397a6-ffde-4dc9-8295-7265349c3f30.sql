-- ============================================
-- High Priority Security Fixes
-- ============================================

-- 1. Add customer access token expiration to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone 
DEFAULT (now() + interval '90 days');

-- Set expiration for existing tokens (90 days from now)
UPDATE invoices 
SET token_expires_at = now() + interval '90 days'
WHERE token_expires_at IS NULL;

-- Create function to validate token hasn't expired
CREATE OR REPLACE FUNCTION public.is_valid_access_token(token_value uuid, invoice_table_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM invoices 
    WHERE id = invoice_table_id
      AND customer_access_token = token_value
      AND (token_expires_at IS NULL OR token_expires_at > now())
  );
$function$;

-- 2. Fix array field type mismatches (primary_protein, secondary_protein)
-- First, convert text to jsonb array for existing data
UPDATE quote_requests
SET primary_protein = CASE 
  WHEN primary_protein IS NULL OR primary_protein = '' THEN '[]'::jsonb
  WHEN primary_protein LIKE '[%' THEN primary_protein::jsonb
  ELSE jsonb_build_array(primary_protein)
END::text
WHERE primary_protein IS NOT NULL;

UPDATE quote_requests
SET secondary_protein = CASE 
  WHEN secondary_protein IS NULL OR secondary_protein = '' THEN '[]'::jsonb
  WHEN secondary_protein LIKE '[%' THEN secondary_protein::jsonb
  ELSE jsonb_build_array(secondary_protein)
END::text
WHERE secondary_protein IS NOT NULL;

-- Note: Keeping as text type for now since the app already handles it
-- A full migration to jsonb would require updating all application code

-- 3. Prevent duplicate non-draft invoices per quote
-- Create unique partial index to allow only one non-draft invoice per quote
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_non_draft_invoice_per_quote 
ON invoices(quote_request_id) 
WHERE is_draft = false;

-- Update the prevent_duplicate_invoices trigger to be more strict
CREATE OR REPLACE FUNCTION public.prevent_duplicate_invoices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if there's already a non-draft invoice for this quote
    IF NEW.is_draft = false AND EXISTS (
        SELECT 1 FROM invoices 
        WHERE quote_request_id = NEW.quote_request_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND is_draft = false
    ) THEN
        RAISE EXCEPTION 'A non-draft invoice already exists for this quote (ID: %). Convert existing invoice to draft first or create a new estimate version.', NEW.quote_request_id;
    END IF;
    
    RETURN NEW;
END;
$function$;