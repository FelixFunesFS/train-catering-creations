-- =====================================================
-- Enable Cron Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =====================================================
-- Configure Automated Workflow Cron Jobs
-- =====================================================

-- 1. Auto-workflow-manager: Runs every 15 minutes
-- Handles: overdue invoices, auto-confirmations, auto-completions, payment reminders
SELECT cron.schedule(
  'auto-workflow-manager-every-15-min',
  '*/15 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/auto-workflow-manager',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body := jsonb_build_object('scheduled_run', true, 'time', now())
  );
  $$
);

-- 2. Send automated reminders: Runs daily at 9 AM
-- Handles: urgent payments (7 days before event), final confirmations (14 days), overdue payments
SELECT cron.schedule(
  'send-automated-reminders-daily',
  '0 9 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/send-automated-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body := jsonb_build_object('scheduled_run', true, 'time', now())
  );
  $$
);

-- 3. Event follow-up: Runs daily at 10 AM
-- Handles: thank you + feedback requests for events that happened yesterday
SELECT cron.schedule(
  'send-event-followup-daily',
  '0 10 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/send-event-followup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body := jsonb_build_object('scheduled_run', true, 'time', now())
  );
  $$
);

-- =====================================================
-- Verify Cron Jobs
-- =====================================================
-- Query to check all scheduled jobs:
-- SELECT jobid, schedule, command, nodename, nodeport, database, username, active 
-- FROM cron.job;

-- =====================================================
-- Unschedule Commands (for reference)
-- =====================================================
-- To remove jobs if needed:
-- SELECT cron.unschedule('auto-workflow-manager-every-15-min');
-- SELECT cron.unschedule('send-automated-reminders-daily');
-- SELECT cron.unschedule('send-event-followup-daily');