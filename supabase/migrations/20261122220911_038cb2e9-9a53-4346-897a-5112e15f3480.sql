CREATE OR REPLACE FUNCTION public.realign_milestones_on_event_date()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_today date := (now() AT TIME ZONE 'America/New_York')::date; v_count int := 0; v_n int;
BEGIN
 IF NEW.event_date IS NOT DISTINCT FROM OLD.event_date OR NEW.event_date IS NULL THEN RETURN NEW; END IF;
 UPDATE payment_milestones pm SET due_date = CASE
   WHEN pm.is_net30 THEN NEW.event_date + 30
   WHEN pm.milestone_type = 'MILESTONE' THEN GREATEST(NEW.event_date - 30, v_today)
   WHEN pm.milestone_type IN ('FINAL','BALANCE') THEN GREATEST(NEW.event_date - 14, v_today)
   WHEN pm.milestone_type = 'FULL' AND NOT COALESCE(pm.is_due_now,false) THEN GREATEST(NEW.event_date - 14, v_today)
   ELSE pm.due_date END,
  updated_at = now()
 FROM invoices i
 WHERE pm.invoice_id = i.id AND i.quote_request_id = NEW.id
   AND pm.status IS DISTINCT FROM 'paid'
   AND (pm.is_net30 OR pm.milestone_type IN ('MILESTONE','FINAL','BALANCE') OR (pm.milestone_type='FULL' AND NOT COALESCE(pm.is_due_now,false)));
 GET DIAGNOSTICS v_n = ROW_COUNT; v_count := v_n;
 IF v_count > 0 THEN
  INSERT INTO quote_request_history(quote_request_id, field_name, old_value, new_value, changed_by, change_reason)
  VALUES (NEW.id, 'payment_due_dates', OLD.event_date::text, NEW.event_date::text, 'system',
   'Event date changed - ' || v_count || ' unpaid payment due date(s) moved');
 END IF;
 RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.realign_milestones_on_event_date() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS realign_milestones_on_event_date ON public.quote_requests;
CREATE TRIGGER realign_milestones_on_event_date AFTER UPDATE OF event_date ON public.quote_requests
 FOR EACH ROW EXECUTE FUNCTION public.realign_milestones_on_event_date();

CREATE OR REPLACE FUNCTION public.submit_customer_change_request(p_invoice_id uuid, p_request_type text, p_requested_changes jsonb, p_customer_comments text DEFAULT NULL::text, p_priority text DEFAULT 'medium'::text, p_access_token text DEFAULT NULL::text)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_email text; v_id uuid;
BEGIN
 IF p_request_type IS NULL OR p_request_type NOT IN ('modification','cancellation','date_change','guest_count_change') OR p_priority IS NULL OR p_priority NOT IN ('low','medium','high','urgent') THEN
  RAISE EXCEPTION 'Invalid change request' USING ERRCODE='22023';
 END IF;
 IF p_requested_changes IS NULL OR jsonb_typeof(p_requested_changes)<>'object' OR octet_length(p_requested_changes::text)>20000 OR length(COALESCE(p_customer_comments,''))>5000 THEN
  RAISE EXCEPTION 'Invalid change request details' USING ERRCODE='22023';
 END IF;
 SELECT q.email INTO v_email FROM public.invoices i JOIN public.quote_requests q ON q.id=i.quote_request_id
 WHERE i.id=p_invoice_id AND (
  (i.customer_access_token::text=p_access_token AND (i.token_expires_at IS NULL OR i.token_expires_at>now()))
  OR public.is_admin()
 ) FOR UPDATE OF i;
 IF v_email IS NULL THEN RAISE EXCEPTION 'Invalid or expired estimate link' USING ERRCODE='42501'; END IF;
 SELECT id INTO v_id FROM public.change_requests
 WHERE invoice_id=p_invoice_id AND workflow_status='pending' AND request_type=p_request_type
   AND requested_changes=p_requested_changes AND COALESCE(customer_comments,'')=COALESCE(p_customer_comments,'')
   AND created_at > now() - interval '2 minutes'
 ORDER BY created_at DESC LIMIT 1;
 IF v_id IS NOT NULL THEN RAISE NOTICE 'duplicate'; RETURN v_id; END IF;
 INSERT INTO public.change_requests(invoice_id,customer_email,request_type,requested_changes,customer_comments,priority,workflow_status)
 VALUES(p_invoice_id,v_email,p_request_type,p_requested_changes,p_customer_comments,p_priority,'pending') RETURNING id INTO v_id;
 RETURN v_id;
END $function$;