-- Fix tax rate in recalculate_invoice_totals trigger
-- Change from 8% to 9% (2% hospitality + 7% service tax)

CREATE OR REPLACE FUNCTION public.recalculate_invoice_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_id UUID;
  v_subtotal INTEGER;
  v_tax_amount INTEGER;
  v_total_amount INTEGER;
  v_is_gov BOOLEAN;
  v_tax_rate NUMERIC := 0.09; -- 9% tax (2% hospitality + 7% service)
  v_old_total INTEGER;
BEGIN
  -- Get invoice_id from the operation
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get current total before update for audit
  SELECT total_amount INTO v_old_total
  FROM invoices
  WHERE id = v_invoice_id;
  
  -- Calculate subtotal from all line items
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM invoice_line_items
  WHERE invoice_id = v_invoice_id;
  
  -- Check if government contract (tax exempt)
  SELECT 
    COALESCE(qr.compliance_level = 'government', false) OR
    COALESCE(qr.requires_po_number, false)
  INTO v_is_gov
  FROM invoices i
  LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
  WHERE i.id = v_invoice_id;
  
  -- Calculate tax (0 if government, 9% otherwise)
  IF COALESCE(v_is_gov, false) THEN
    v_tax_amount := 0;
  ELSE
    v_tax_amount := ROUND(v_subtotal * v_tax_rate);
  END IF;
  
  v_total_amount := v_subtotal + v_tax_amount;
  
  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total_amount,
    updated_at = NOW()
  WHERE id = v_invoice_id;
  
  -- Log to audit trail only if totals changed
  IF v_old_total IS DISTINCT FROM v_total_amount THEN
    INSERT INTO invoice_audit_log (
      invoice_id,
      field_changed,
      old_value,
      new_value,
      changed_by
    ) VALUES (
      v_invoice_id,
      'totals_auto_recalculated',
      jsonb_build_object(
        'subtotal', COALESCE((SELECT subtotal FROM invoices WHERE id = v_invoice_id), 0),
        'tax_amount', COALESCE((SELECT tax_amount FROM invoices WHERE id = v_invoice_id), 0),
        'total_amount', v_old_total
      ),
      jsonb_build_object(
        'subtotal', v_subtotal,
        'tax_amount', v_tax_amount,
        'total_amount', v_total_amount,
        'is_gov_contract', COALESCE(v_is_gov, false),
        'tax_rate', v_tax_rate
      ),
      'database_trigger'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;