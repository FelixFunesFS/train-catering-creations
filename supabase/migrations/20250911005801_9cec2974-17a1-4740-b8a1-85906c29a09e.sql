-- Simple status updates without triggers
UPDATE quote_requests 
SET status = 'quoted'
WHERE id IN (
  SELECT qr.id 
  FROM quote_requests qr
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending' 
  AND i.total_amount > 0
  AND i.is_draft = true
);

UPDATE quote_requests
SET status = 'confirmed'
WHERE id IN (
  SELECT qr.id
  FROM quote_requests qr 
  JOIN invoices i ON qr.id = i.quote_request_id
  WHERE qr.status = 'pending'
  AND i.status IN ('sent', 'viewed', 'approved')
);