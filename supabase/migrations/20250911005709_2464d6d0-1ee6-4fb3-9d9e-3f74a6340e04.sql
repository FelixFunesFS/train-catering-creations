-- Data Cleanup Plan Implementation (Simple Updates)

-- Step 1: Standardize document types first
UPDATE invoices 
SET document_type = 'estimate'
WHERE is_draft = true 
AND document_type = 'invoice';

-- Step 2: Complete pricing for zero-value line items
UPDATE invoice_line_items 
SET unit_price = 1800, total_price = 1800 * quantity
WHERE title ILIKE '%meal bundle%' AND unit_price = 0;

UPDATE invoice_line_items 
SET unit_price = 450, total_price = 450 * quantity
WHERE title ILIKE '%appetizer%' AND unit_price = 0;

UPDATE invoice_line_items 
SET unit_price = 350, total_price = 350 * quantity
WHERE title ILIKE '%dessert%' AND unit_price = 0;

UPDATE invoice_line_items 
SET unit_price = 200, total_price = 200 * quantity
WHERE title ILIKE '%service%' AND unit_price = 0;

-- Step 3: Update invoice totals
UPDATE invoices 
SET subtotal = (
  SELECT COALESCE(SUM(total_price), 0) 
  FROM invoice_line_items 
  WHERE invoice_id = invoices.id
)
WHERE subtotal = 0;

UPDATE invoices 
SET tax_amount = ROUND(subtotal * 0.08)
WHERE tax_amount = 0 AND subtotal > 0;

UPDATE invoices 
SET total_amount = subtotal + tax_amount
WHERE total_amount = 0 AND subtotal > 0;