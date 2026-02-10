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

-- =====================================================
-- UNIFIED REMINDER SYSTEM
-- Runs daily at 9 AM - handles ALL reminders and workflow automations:
-- - Payment reminders (overdue, upcoming milestones)
-- - Event reminders (7-day, 2-day, thank you)
-- - Auto-mark overdue invoices
-- - Auto-confirm paid events
-- - Auto-complete past events
-- =====================================================
SELECT cron.schedule(
  'unified-reminder-system-daily',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/unified-reminder-system',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
        body:=concat('{"scheduled_run": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- =====================================================
-- TOKEN RENEWAL MANAGER
-- Runs daily at 2 AM - handles customer access token expiration
-- =====================================================
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

-- =====================================================
-- Verify scheduled jobs
-- =====================================================
-- Run this to see all scheduled jobs:
SELECT * FROM cron.job;

-- =====================================================
-- CLEANUP: Remove old deprecated cron jobs
-- Run these to remove the old separate jobs if they exist:
-- =====================================================
-- (auto-workflow-manager removed — fully replaced by unified-reminder-system)
-- SELECT cron.unschedule('payment-reminder-daily');
-- SELECT cron.unschedule('send-reminders-daily');
-- SELECT cron.unschedule('send-automated-reminders-daily');

-- =====================================================
-- To unschedule current jobs if needed
-- =====================================================
-- SELECT cron.unschedule('unified-reminder-system-daily');
-- SELECT cron.unschedule('token-renewal-manager-daily');

-- =====================================================
-- To manually trigger a job for testing
-- =====================================================
-- Just call the edge function directly via the Supabase dashboard
-- or use curl:
-- curl -X POST https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/unified-reminder-system \
--   -H "Authorization: Bearer YOUR_ANON_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{"manual_trigger": true}'
