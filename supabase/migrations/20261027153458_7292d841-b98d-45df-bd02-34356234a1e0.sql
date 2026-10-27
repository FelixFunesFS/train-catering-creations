CREATE OR REPLACE FUNCTION public.get_processing_online_payment(access_token text)
RETURNS TABLE(amount integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pt.amount, pt.created_at
  FROM payment_transactions pt
  JOIN invoices i ON i.id = pt.invoice_id
  WHERE i.customer_access_token::text = access_token
    AND (i.token_expires_at IS NULL OR i.token_expires_at > now())
    AND pt.status = 'pending'
    AND pt.payment_method = 'stripe'
    AND pt.created_at > now() - interval '7 days'
    AND pt.created_at < now() - interval '1 hour'
  ORDER BY pt.created_at DESC
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_processing_online_payment(text) TO anon, authenticated;