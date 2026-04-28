CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop broken cron by jobid using cron.unschedule
SELECT cron.unschedule(3) WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobid = 3);

-- Remove existing unified job if any (safe re-run)
SELECT cron.unschedule('unified-reminder-system-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'unified-reminder-system-daily');

-- Schedule unified reminder system at 9 AM Eastern (14:00 UTC) daily
SELECT cron.schedule(
  'unified-reminder-system-daily',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/unified-reminder-system',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHBycnFqbGN2ZmtoZmRubm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NjMzNTcsImV4cCI6MjA2OTEzOTM1N30.5ZMvbmhEkcmn_s_Q8ZI3KOPGZD1_kmH0OCUVL3gK3rE"}'::jsonb,
    body := concat('{"scheduled_run": true, "time": "', now(), '"}')::jsonb
  );
  $$
);