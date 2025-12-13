-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_estimate_with_line_items(uuid);

-- Recreate without document_type filter
CREATE OR REPLACE FUNCTION public.get_estimate_with_line_items(access_token uuid)
RETURNS TABLE(invoice json, line_items json, milestones json, quote json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_quote_id uuid;
BEGIN
  -- Find the invoice by access token (no document_type filter)
  SELECT i.id, i.quote_request_id INTO v_invoice_id, v_quote_id
  FROM invoices i
  WHERE i.customer_access_token = access_token
    AND (i.token_expires_at IS NULL OR i.token_expires_at > now());

  IF v_invoice_id IS NULL THEN
    RETURN;
  END IF;

  -- Update view tracking
  UPDATE invoices 
  SET viewed_at = COALESCE(viewed_at, now()),
      last_customer_interaction = now(),
      workflow_status = CASE 
        WHEN workflow_status = 'sent' THEN 'viewed'::invoice_workflow_status
        ELSE workflow_status
      END
  WHERE id = v_invoice_id;

  RETURN QUERY
  SELECT 
    row_to_json(i.*) as invoice,
    COALESCE(
      (SELECT json_agg(li.* ORDER BY li.created_at)
       FROM invoice_line_items li 
       WHERE li.invoice_id = v_invoice_id),
      '[]'::json
    ) as line_items,
    COALESCE(
      (SELECT json_agg(pm.* ORDER BY pm.due_date)
       FROM payment_milestones pm 
       WHERE pm.invoice_id = v_invoice_id),
      '[]'::json
    ) as milestones,
    row_to_json(qr.*) as quote
  FROM invoices i
  LEFT JOIN quote_requests qr ON qr.id = v_quote_id
  WHERE i.id = v_invoice_id;
END;
$$;

-- Update existing invoices that should be estimates
UPDATE invoices 
SET document_type = 'estimate' 
WHERE workflow_status IN ('draft', 'sent', 'viewed', 'approved', 'pending_review')
  AND paid_at IS NULL;