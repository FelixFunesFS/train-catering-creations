-- Fix recalculate_invoice_totals function for DELETE operations and add discount support
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
  v_tax_rate NUMERIC := 0.09;
  v_old_total INTEGER;
  v_discount_amount INTEGER;
  v_discount_type TEXT;
  v_discount_value INTEGER;
  v_taxable_amount INTEGER;
BEGIN
  -- Handle both INSERT/UPDATE (NEW) and DELETE (OLD)
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Skip if no invoice_id
  IF v_invoice_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Get current total before update for audit
  SELECT total_amount, discount_amount, discount_type 
  INTO v_old_total, v_discount_value, v_discount_type
  FROM invoices
  WHERE id = v_invoice_id;
  
  -- Calculate subtotal from all line items
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM invoice_line_items
  WHERE invoice_id = v_invoice_id;
  
  -- Calculate discount amount based on type
  v_discount_amount := 0;
  IF v_discount_value IS NOT NULL AND v_discount_value > 0 THEN
    IF v_discount_type = 'percentage' THEN
      v_discount_amount := ROUND(v_subtotal * (v_discount_value::NUMERIC / 100));
    ELSIF v_discount_type = 'fixed' THEN
      v_discount_amount := v_discount_value;
    END IF;
  END IF;
  
  -- Calculate taxable amount after discount
  v_taxable_amount := GREATEST(v_subtotal - v_discount_amount, 0);
  
  -- Check if government contract (tax exempt)
  SELECT 
    COALESCE(qr.compliance_level = 'government', false) OR
    COALESCE(qr.requires_po_number, false)
  INTO v_is_gov
  FROM invoices i
  LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
  WHERE i.id = v_invoice_id;
  
  -- Calculate tax (0 if government, 9% otherwise) on taxable amount
  IF COALESCE(v_is_gov, false) THEN
    v_tax_amount := 0;
  ELSE
    v_tax_amount := ROUND(v_taxable_amount * v_tax_rate);
  END IF;
  
  v_total_amount := v_taxable_amount + v_tax_amount;
  
  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total_amount,
    updated_at = NOW()
  WHERE id = v_invoice_id;
  
  -- Log to audit trail only if totals changed significantly
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
        'total_amount', v_old_total
      ),
      jsonb_build_object(
        'subtotal', v_subtotal,
        'discount_type', v_discount_type,
        'discount_value', v_discount_value,
        'discount_applied', v_discount_amount,
        'taxable_amount', v_taxable_amount,
        'tax_amount', v_tax_amount,
        'total_amount', v_total_amount,
        'is_gov_contract', COALESCE(v_is_gov, false)
      ),
      'database_trigger'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Also fix force_recalculate_invoice_totals to include discount support
CREATE OR REPLACE FUNCTION public.force_recalculate_invoice_totals(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_subtotal INTEGER;
  v_tax_amount INTEGER;
  v_is_gov BOOLEAN;
  v_tax_rate NUMERIC := 0.09;
  v_discount_amount INTEGER;
  v_discount_type TEXT;
  v_discount_value INTEGER;
  v_taxable_amount INTEGER;
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
  FROM invoice_line_items WHERE invoice_id = p_invoice_id;
  
  -- Get discount info
  SELECT discount_amount, discount_type 
  INTO v_discount_value, v_discount_type
  FROM invoices WHERE id = p_invoice_id;
  
  -- Calculate discount amount based on type
  v_discount_amount := 0;
  IF v_discount_value IS NOT NULL AND v_discount_value > 0 THEN
    IF v_discount_type = 'percentage' THEN
      v_discount_amount := ROUND(v_subtotal * (v_discount_value::NUMERIC / 100));
    ELSIF v_discount_type = 'fixed' THEN
      v_discount_amount := v_discount_value;
    END IF;
  END IF;
  
  -- Calculate taxable amount after discount
  v_taxable_amount := GREATEST(v_subtotal - v_discount_amount, 0);
  
  -- Get government status from quote
  SELECT COALESCE(qr.compliance_level = 'government', false) OR COALESCE(qr.requires_po_number, false)
  INTO v_is_gov
  FROM invoices i
  LEFT JOIN quote_requests qr ON i.quote_request_id = qr.id
  WHERE i.id = p_invoice_id;
  
  -- Calculate tax (0 for government, 9% for standard) on taxable amount
  v_tax_amount := CASE WHEN v_is_gov THEN 0 ELSE ROUND(v_taxable_amount * v_tax_rate) END;
  
  -- Update invoice with correct totals
  UPDATE invoices
  SET subtotal = v_subtotal,
      tax_amount = v_tax_amount,
      total_amount = v_taxable_amount + v_tax_amount,
      updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$function$;

-- Create the missing trigger on invoice_line_items
DROP TRIGGER IF EXISTS trigger_recalculate_invoice_totals ON invoice_line_items;

CREATE TRIGGER trigger_recalculate_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_invoice_totals();