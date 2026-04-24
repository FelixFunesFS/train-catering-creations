ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_idempotency_key_idx
  ON public.quote_requests(idempotency_key)
  WHERE idempotency_key IS NOT NULL;