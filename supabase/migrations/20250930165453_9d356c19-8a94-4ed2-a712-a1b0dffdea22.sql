-- Clean up duplicate invoices - keep only the most recent one per quote_request_id
-- First, delete audit log entries for duplicate invoices
DELETE FROM invoice_audit_log
WHERE invoice_id IN (
  SELECT id 
  FROM invoices 
  WHERE quote_request_id = '4648a173-249f-4042-9aae-6915f64268d1'
  AND id != '41201463-408b-447f-b166-30bb6e6bc4a5'  -- Keep only the most recent
);

-- Second, delete line items from duplicate invoices
DELETE FROM invoice_line_items 
WHERE invoice_id IN (
  SELECT id 
  FROM invoices 
  WHERE quote_request_id = '4648a173-249f-4042-9aae-6915f64268d1'
  AND id != '41201463-408b-447f-b166-30bb6e6bc4a5'  -- Keep only the most recent
);

-- Finally, delete the duplicate invoices themselves
DELETE FROM invoices 
WHERE quote_request_id = '4648a173-249f-4042-9aae-6915f64268d1'
AND id != '41201463-408b-447f-b166-30bb6e6bc4a5';  -- Keep only the most recent