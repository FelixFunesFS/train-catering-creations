-- Drop the problematic function and all dependent objects
DROP FUNCTION IF EXISTS public.update_quote_request_status() CASCADE;

-- Data Cleanup - Pricing and Document Types Only
-- Update line items pricing first (no triggers involved)
UPDATE invoice_line_items 
SET unit_price = CASE 
  WHEN title ILIKE '%meal bundle%' AND unit_price = 0 THEN 1600
  WHEN title ILIKE '%appetizer%' AND unit_price = 0 THEN 450
  WHEN title ILIKE '%dessert%' AND unit_price = 0 THEN 350
  WHEN title ILIKE '%service%' AND unit_price = 0 THEN 200
  ELSE unit_price
END,
total_price = CASE 
  WHEN title ILIKE '%meal bundle%' AND total_price = 0 THEN 1600 * quantity
  WHEN title ILIKE '%appetizer%' AND total_price = 0 THEN 450 * quantity
  WHEN title ILIKE '%dessert%' AND total_price = 0 THEN 350 * quantity
  WHEN title ILIKE '%service%' AND total_price = 0 THEN 200 * quantity
  ELSE total_price
END
WHERE unit_price = 0 OR total_price = 0;

-- Update invoice totals
UPDATE invoices 
SET subtotal = (
  SELECT COALESCE(SUM(total_price), 0) 
  FROM invoice_line_items 
  WHERE invoice_id = invoices.id
),
tax_amount = ROUND((
  SELECT COALESCE(SUM(total_price), 0) 
  FROM invoice_line_items 
  WHERE invoice_id = invoices.id
) * 0.08),
total_amount = (
  SELECT COALESCE(SUM(total_price), 0) 
  FROM invoice_line_items 
  WHERE invoice_id = invoices.id
) + ROUND((
  SELECT COALESCE(SUM(total_price), 0) 
  FROM invoice_line_items 
  WHERE invoice_id = invoices.id
) * 0.08)
WHERE total_amount = 0 OR subtotal = 0;

-- Standardize document types
UPDATE invoices 
SET document_type = 'estimate'
WHERE is_draft = true 
AND document_type = 'invoice';

-- Re-create basic updated_at trigger
CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();