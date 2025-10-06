-- =====================================================
-- Edge Function Cron Job Setup
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to enable 
-- scheduled edge functions
-- =====================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule auto-workflow-manager to run every 15 minutes
-- This handles automatic status transitions based on customer actions
SELECT cron.schedule(
  'auto-workflow-manager-every-15-min',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/auto-workflow-manager',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
        body:=concat('{"scheduled_run": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule token-renewal-manager to run daily at 2 AM
-- This handles token expiration warnings and renewals
SELECT cron.schedule(
  'token-renewal-manager-daily',
  '0 2 * * *', -- Every day at 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/token-renewal-manager',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
        body:=concat('{"scheduled_run": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule payment reminder checks to run daily at 9 AM
-- This sends payment reminders for overdue invoices
SELECT cron.schedule(
  'payment-reminder-daily',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/send-payment-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
        body:=concat('{"scheduled_run": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- =====================================================
-- Verify scheduled jobs
-- =====================================================
-- Run this to see all scheduled jobs:
SELECT * FROM cron.job;

-- =====================================================
-- To unschedule jobs if needed
-- =====================================================
-- SELECT cron.unschedule('auto-workflow-manager-every-15-min');
-- SELECT cron.unschedule('token-renewal-manager-daily');
-- SELECT cron.unschedule('payment-reminder-daily');

-- =====================================================
-- To manually trigger a job for testing
-- =====================================================
-- Just call the edge function directly via the Supabase dashboard
-- or use curl:
-- curl -X POST https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/auto-workflow-manager \
--   -H "Authorization: Bearer YOUR_ANON_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{"manual_trigger": true}'
