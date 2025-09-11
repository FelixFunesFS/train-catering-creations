-- Drop the problematic trigger function completely
DROP FUNCTION IF EXISTS public.update_quote_request_status();

-- Simple manual status update without triggers
UPDATE quote_requests 
SET status = 'quoted'
WHERE id IN (
  SELECT qr.id 
  FROM quote_requests qr
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending' 
  AND i.total_amount > 1000
  AND i.is_draft = true
);