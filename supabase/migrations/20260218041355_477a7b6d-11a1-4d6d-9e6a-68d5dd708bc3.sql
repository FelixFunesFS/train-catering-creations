UPDATE payment_transactions
SET status = 'voided',
    failed_reason = 'Stale checkout session - auto-cleaned'
WHERE status = 'pending'
  AND payment_method = 'stripe'
  AND created_at < NOW() - INTERVAL '1 hour';