-- Create secure RPC function for customer portal line items access
-- Bypasses RLS and validates access tokens server-side

CREATE OR REPLACE FUNCTION get_estimate_with_line_items(access_token UUID)
RETURNS TABLE (
  invoice JSONB,
  quote JSONB,
  line_items JSONB,
  milestones JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id UUID;
  v_quote_id UUID;
  v_token_expires TIMESTAMPTZ;
BEGIN
  -- Validate token and get invoice
  SELECT i.id, i.quote_request_id, i.token_expires_at
  INTO v_invoice_id, v_quote_id, v_token_expires
  FROM invoices i
  WHERE i.customer_access_token = access_token
    AND i.document_type = 'estimate';
  
  -- Check if token found
  IF v_invoice_id IS NULL THEN
    RAISE EXCEPTION 'Invalid access token';
  END IF;
  
  -- Check if token expired
  IF v_token_expires IS NOT NULL AND v_token_expires < NOW() THEN
    RAISE EXCEPTION 'Access token has expired';
  END IF;
  
  -- Return all data in one query
  RETURN QUERY
  SELECT 
    to_jsonb(i.*) as invoice,
    to_jsonb(qr.*) as quote,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(ili.*) ORDER BY ili.category, ili.created_at)
       FROM invoice_line_items ili
       WHERE ili.invoice_id = v_invoice_id),
      '[]'::jsonb
    ) as line_items,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(pm.*) ORDER BY pm.milestone_type)
       FROM payment_milestones pm
       WHERE pm.invoice_id = v_invoice_id),
      '[]'::jsonb
    ) as milestones
  FROM invoices i
  LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
  WHERE i.id = v_invoice_id;
END;
$$;

COMMENT ON FUNCTION get_estimate_with_line_items IS 'Securely fetch estimate data for customer portal using access token';