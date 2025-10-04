-- ============================================
-- Invoice Number Generation + Optimistic Locking
-- ============================================

-- 1. Create sequence for invoice numbers (resets annually)
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1;

-- 2. Function to generate formatted invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_year text;
  next_seq integer;
  invoice_num text;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- Get next sequence value
  next_seq := nextval('invoice_number_seq');
  
  -- Format as INV-YYYY-#### (padded to 4 digits)
  invoice_num := 'INV-' || current_year || '-' || LPAD(next_seq::text, 4, '0');
  
  RETURN invoice_num;
END;
$function$;

-- 3. Trigger to auto-populate invoice_number on INSERT
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only generate if invoice_number is NULL (allows manual override)
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_set_invoice_number ON invoices;
CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- 4. Backfill existing invoices with sequential numbers
DO $backfill$
DECLARE
  invoice_record RECORD;
  seq_counter integer := 1;
  invoice_year text;
BEGIN
  -- Update existing NULL invoice numbers, ordered by created_at
  FOR invoice_record IN 
    SELECT id, EXTRACT(YEAR FROM created_at)::text AS year
    FROM invoices 
    WHERE invoice_number IS NULL
    ORDER BY created_at ASC
  LOOP
    invoice_year := invoice_record.year;
    UPDATE invoices 
    SET invoice_number = 'INV-' || invoice_year || '-' || LPAD(seq_counter::text, 4, '0')
    WHERE id = invoice_record.id;
    seq_counter := seq_counter + 1;
  END LOOP;
END $backfill$;

-- 5. Add version column to invoices for optimistic locking
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- 6. Add version column to quote_requests for optimistic locking
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- 7. Trigger to increment version on UPDATE for invoices
CREATE OR REPLACE FUNCTION public.increment_version_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Increment version and update timestamp
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_increment_invoice_version ON invoices;
CREATE TRIGGER trigger_increment_invoice_version
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION increment_version_on_update();

-- 8. Trigger to increment version on UPDATE for quote_requests
DROP TRIGGER IF EXISTS trigger_increment_quote_version ON quote_requests;
CREATE TRIGGER trigger_increment_quote_version
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION increment_version_on_update();

-- 9. Create index for faster version checks
CREATE INDEX IF NOT EXISTS idx_invoices_version ON invoices(id, version);
CREATE INDEX IF NOT EXISTS idx_quote_requests_version ON quote_requests(id, version);