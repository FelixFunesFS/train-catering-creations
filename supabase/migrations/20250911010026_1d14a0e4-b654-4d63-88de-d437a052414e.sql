-- Simple data cleanup - Part 3: Update invoice totals
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
WHERE total_amount = 0;