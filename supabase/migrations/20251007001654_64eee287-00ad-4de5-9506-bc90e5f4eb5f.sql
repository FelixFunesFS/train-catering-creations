-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job for auto-workflow-manager (every 15 minutes)
-- This handles: overdue invoices, event confirmations, completed events, payment reminders
SELECT cron.schedule(
  'auto-workflow-manager-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/auto-workflow-manager',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Create cron job for token-renewal-manager (daily at 2 AM)
-- This sends warnings for expiring customer access tokens
SELECT cron.schedule(
  'token-renewal-manager-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/token-renewal-manager',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Update existing invoices with short-lived tokens to 1 year
UPDATE invoices
SET token_expires_at = created_at + INTERVAL '1 year'
WHERE token_expires_at < created_at + INTERVAL '1 year'
  OR token_expires_at IS NULL;

-- Update the default token expiry to 1 year for new invoices
ALTER TABLE invoices 
ALTER COLUMN token_expires_at SET DEFAULT (now() + INTERVAL '1 year');