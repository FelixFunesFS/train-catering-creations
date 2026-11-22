DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'increment_version_on_update()','log_invoice_changes()','log_invoice_workflow_changes()','log_quote_request_changes()',
    'prevent_duplicate_invoices()','recalculate_invoice_totals()','recalculate_milestone_amounts()','set_invoice_number()',
    'sync_invoice_to_quote_status()','sync_invoice_to_quote_workflow()','update_status_timestamp()','update_thread_last_message()',
    'update_updated_at_column()','update_workflow_status()','validate_payment_transaction()',
    'grant_first_admin()','check_workflow_consistency(uuid)','generate_invoice_number()','is_admin_original()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.force_recalculate_invoice_totals(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.force_recalculate_invoice_totals(uuid) TO authenticated, service_role;