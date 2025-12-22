-- Create RPC function to force recalculate invoice totals
-- This ensures single source of truth when government status changes

CREATE OR REPLACE FUNCTION public.force_recalculate_invoice_totals(p_invoice_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_subtotal INTEGER;
  v_tax_amount INTEGER;
  v_is_gov BOOLEAN;
  v_tax_rate NUMERIC := 0.09;
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
  FROM invoice_line_items WHERE invoice_id = p_invoice_id;
  
  -- Get government status from quote (with fresh read)
  SELECT COALESCE(qr.compliance_level = 'government', false) OR COALESCE(qr.requires_po_number, false)
  INTO v_is_gov
  FROM invoices i
  LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
  WHERE i.id = p_invoice_id;
  
  -- Calculate tax (0 for government, 9% for standard)
  v_tax_amount := CASE WHEN v_is_gov THEN 0 ELSE ROUND(v_subtotal * v_tax_rate) END;
  
  -- Update invoice with correct totals
  UPDATE invoices
  SET subtotal = v_subtotal,
      tax_amount = v_tax_amount,
      total_amount = v_subtotal + v_tax_amount,
      updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.force_recalculate_invoice_totals(UUID) TO authenticated;