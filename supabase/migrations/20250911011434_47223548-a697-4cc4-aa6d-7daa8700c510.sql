-- Fix Quote Status Synchronization: Update quote statuses based on current workflow state

-- Update quotes that have draft estimates to 'quoted' status  
UPDATE quote_requests 
SET 
  status = 'quoted',
  workflow_status = 'estimated',
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.is_draft = true 
  AND qr.status = 'pending'
);

-- Update quotes that have approved/final invoices to 'confirmed' status
UPDATE quote_requests 
SET 
  status = 'confirmed', 
  workflow_status = 'confirmed',
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.is_draft = false 
  AND qr.status IN ('pending', 'quoted')
);

-- Update quotes that have paid invoices to 'completed' status
UPDATE quote_requests 
SET 
  status = 'completed',
  workflow_status = 'completed', 
  last_status_change = now()
WHERE id IN (
  SELECT DISTINCT qr.id 
  FROM quote_requests qr
  INNER JOIN invoices i ON i.quote_request_id = qr.id
  WHERE i.status = 'paid'
  AND qr.status != 'completed'
);