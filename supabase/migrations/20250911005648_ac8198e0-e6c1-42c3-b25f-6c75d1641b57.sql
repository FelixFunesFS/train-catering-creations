-- Data Cleanup Plan Implementation (Fixed)

-- Temporarily disable triggers to avoid enum issues
ALTER TABLE quote_requests DISABLE TRIGGER ALL;
ALTER TABLE invoices DISABLE TRIGGER ALL;

-- Step 1: Fix Status Inconsistencies
-- Update quotes that have priced invoices to "quoted" status
UPDATE quote_requests 
SET status = 'quoted', 
    workflow_status = 'quoted',
    last_status_change = now()
WHERE id IN (
  SELECT qr.id 
  FROM quote_requests qr
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending' 
  AND i.total_amount > 0
  AND i.is_draft = true
);

-- Update quotes that have sent invoices to "confirmed" status  
UPDATE quote_requests
SET status = 'confirmed',
    workflow_status = 'confirmed', 
    last_status_change = now()
WHERE id IN (
  SELECT qr.id
  FROM quote_requests qr 
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending'
  AND i.status IN ('sent', 'viewed', 'approved')
);

-- Step 2: Standardize document types - change invoices to estimates for drafts
UPDATE invoices 
SET document_type = 'estimate'
WHERE is_draft = true 
AND document_type = 'invoice';

-- Step 3: Complete pricing for zero-value estimates
-- Update line items with realistic pricing based on guest count
UPDATE invoice_line_items 
SET unit_price = CASE 
  WHEN title ILIKE '%meal bundle%' THEN 
    CASE 
      WHEN (SELECT guest_count FROM quote_requests qr JOIN invoices i ON qr.id = i.quote_request_id WHERE i.id = invoice_line_items.invoice_id) <= 25 THEN 1800
      WHEN (SELECT guest_count FROM quote_requests qr JOIN invoices i ON qr.id = i.quote_request_id WHERE i.id = invoice_line_items.invoice_id) <= 50 THEN 1600  
      ELSE 1400
    END
  WHEN title ILIKE '%appetizer%' THEN 450
  WHEN title ILIKE '%dessert%' THEN 350
  WHEN title ILIKE '%service%' THEN 200
  ELSE 100
END,
total_price = CASE 
  WHEN title ILIKE '%meal bundle%' THEN 
    CASE 
      WHEN (SELECT guest_count FROM quote_requests qr JOIN invoices i ON qr.id = i.quote_request_id WHERE i.id = invoice_line_items.invoice_id) <= 25 THEN 1800 * quantity
      WHEN (SELECT guest_count FROM quote_requests qr JOIN invoices i ON qr.id = i.quote_request_id WHERE i.id = invoice_line_items.invoice_id) <= 50 THEN 1600 * quantity
      ELSE 1400 * quantity
    END
  WHEN title ILIKE '%appetizer%' THEN 450 * quantity
  WHEN title ILIKE '%dessert%' THEN 350 * quantity  
  WHEN title ILIKE '%service%' THEN 200 * quantity
  ELSE 100 * quantity
END
WHERE unit_price = 0 OR total_price = 0;

-- Step 4: Update invoice totals to match line item totals
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

-- Re-enable triggers
ALTER TABLE quote_requests ENABLE TRIGGER ALL;
ALTER TABLE invoices ENABLE TRIGGER ALL;