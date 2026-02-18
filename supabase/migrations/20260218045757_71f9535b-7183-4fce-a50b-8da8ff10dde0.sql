
DROP FUNCTION IF EXISTS public.get_estimate_with_line_items(text);

CREATE OR REPLACE FUNCTION public.get_estimate_with_line_items(access_token text)
 RETURNS TABLE(invoice json, line_items json, milestones json, quote json, total_paid bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_id uuid;
  v_quote_request_id uuid;
BEGIN
  SELECT id, quote_request_id INTO v_invoice_id, v_quote_request_id
  FROM invoices
  WHERE customer_access_token::text = access_token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF v_invoice_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (SELECT row_to_json(i.*) FROM invoices i WHERE i.id = v_invoice_id) as invoice,
    COALESCE(
      (SELECT json_agg(li.* ORDER BY li.sort_order NULLS LAST, li.created_at)
       FROM invoice_line_items li 
       WHERE li.invoice_id = v_invoice_id),
      '[]'::json
    ) as line_items,
    COALESCE(
      (SELECT json_agg(pm.* ORDER BY pm.due_date NULLS LAST, pm.created_at)
       FROM payment_milestones pm 
       WHERE pm.invoice_id = v_invoice_id),
      '[]'::json
    ) as milestones,
    (SELECT row_to_json(qr.*) FROM quote_requests qr WHERE qr.id = v_quote_request_id) as quote,
    COALESCE(
      (SELECT sum(pt.amount)::bigint FROM payment_transactions pt 
       WHERE pt.invoice_id = v_invoice_id AND pt.status = 'completed'),
      0::bigint
    ) as total_paid;
END;
$function$;
