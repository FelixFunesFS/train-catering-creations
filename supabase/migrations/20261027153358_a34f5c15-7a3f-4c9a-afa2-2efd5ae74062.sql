SELECT cron.unschedule('token-renewal-manager-daily');
DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days';
DELETE FROM public.analytics_events WHERE created_at < now() - interval '12 months';
DELETE FROM public.form_analytics_events WHERE created_at < now() - interval '12 months';
SELECT cron.schedule('purge-cron-run-history-weekly', '0 3 * * 0', $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days'$$);