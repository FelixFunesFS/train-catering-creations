CREATE OR REPLACE FUNCTION public.apply_pricing_suggestion(p_invoice_id uuid, p_suggestion_id uuid, p_tier text, p_user_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
 v_invoice invoices%ROWTYPE; v_log pricing_suggestion_log%ROWTYPE; v_item jsonb; v_line invoice_line_items%ROWTYPE;
 v_items jsonb; v_previous jsonb := '[]'::jsonb; v_unlock timestamptz; v_boundary timestamptz; v_audit uuid;
 v_total integer; v_sum numeric; v_date date; v_today date := (now() AT TIME ZONE 'America/New_York')::date;
 v_pm payment_milestones%ROWTYPE; v_last uuid; v_allocated integer := 0; v_amount integer; v_count integer; v_days integer;
BEGIN
 IF NOT public.has_role(p_user_id,'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
 SELECT * INTO v_invoice FROM invoices WHERE id=p_invoice_id FOR UPDATE;
 IF NOT FOUND OR v_invoice.quote_request_id IS NULL THEN RAISE EXCEPTION 'Pricing requires an inquiry'; END IF;
 LOCK TABLE public.pricing_rules, public.pricing_adjustments, public.business_config IN SHARE MODE;
 PERFORM id FROM quote_requests WHERE id=v_invoice.quote_request_id FOR UPDATE;
 PERFORM id FROM invoice_line_items WHERE invoice_id=p_invoice_id ORDER BY id FOR UPDATE;
 IF v_invoice.workflow_status::text IN ('paid','partially_paid','cancelled') OR EXISTS(SELECT 1 FROM payment_transactions WHERE invoice_id=p_invoice_id AND status='completed') THEN
  RAISE EXCEPTION 'Payment received or event cancelled - pricing frozen';
 END IF;
 SELECT max(created_at) INTO v_unlock FROM pricing_suggestion_log WHERE invoice_id=p_invoice_id AND action='unlock';
 v_boundary := COALESCE(v_invoice.pricing_sent_at,v_invoice.sent_at);
 IF (v_boundary IS NOT NULL OR v_invoice.workflow_status::text NOT IN ('draft','pending_review')) AND (v_unlock IS NULL OR (v_boundary IS NOT NULL AND v_unlock<=v_boundary)) THEN
  RAISE EXCEPTION 'Quote sent - unlock pricing for revision first';
 END IF;
 SELECT * INTO v_log FROM pricing_suggestion_log WHERE id=p_suggestion_id AND invoice_id=p_invoice_id;
 IF NOT FOUND OR v_log.performed_by IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Refresh suggestions before applying'; END IF;
 IF v_log.created_at < now()-interval '15 minutes' THEN RAISE EXCEPTION 'Suggestion expired - refresh first'; END IF;
 IF v_log.basis->>'revision' IS DISTINCT FROM public.pricing_revision(p_invoice_id) THEN RAISE EXCEPTION 'Estimate or pricing settings changed - refresh first'; END IF;
 IF p_tier='undo' THEN
  IF v_log.action<>'apply' OR EXISTS(SELECT 1 FROM pricing_suggestion_log WHERE action='undo' AND basis->>'undo_of'=p_suggestion_id::text) THEN RAISE EXCEPTION 'Cannot undo this change'; END IF;
  v_items := v_log.previous_items;
 ELSE
  IF v_log.action<>'suggest' OR p_tier NOT IN ('competitive','recommended','premium') THEN RAISE EXCEPTION 'Invalid suggestion tier'; END IF;
  v_items := v_log.basis->'tiers'->p_tier->'items';
 END IF;
 IF v_items IS NULL OR jsonb_array_length(v_items)=0 THEN RAISE EXCEPTION 'No priced items'; END IF;
 IF (SELECT count(DISTINCT x->>'id') FROM jsonb_array_elements(v_items) x)<>jsonb_array_length(v_items) THEN RAISE EXCEPTION 'Duplicate items'; END IF;
 FOR v_item IN SELECT value FROM jsonb_array_elements(v_items) LOOP
  SELECT * INTO v_line FROM invoice_line_items WHERE id=(v_item->>'id')::uuid AND invoice_id=p_invoice_id;
  IF NOT FOUND OR (v_item->>'expected_price')::integer IS DISTINCT FROM v_line.unit_price OR (v_item->>'expected_quantity')::numeric IS DISTINCT FROM v_line.quantity THEN RAISE EXCEPTION 'Line items changed - refresh first'; END IF;
  IF (v_item->>'unit_price')::numeric NOT BETWEEN 0 AND 100000000 THEN RAISE EXCEPTION 'Invalid price'; END IF;
  v_previous := v_previous || jsonb_build_array(jsonb_build_object('id',v_line.id,'unit_price',v_line.unit_price,'expected_price',(v_item->>'unit_price')::integer,'expected_quantity',v_line.quantity));
  UPDATE invoice_line_items SET unit_price=(v_item->>'unit_price')::integer,total_price=ROUND((v_item->>'unit_price')::numeric*quantity)::integer WHERE id=v_line.id;
 END LOOP;
 SELECT total_amount INTO v_total FROM invoices WHERE id=p_invoice_id;
 IF v_total<100 THEN RAISE EXCEPTION 'Estimate total must be at least one dollar'; END IF;
 SELECT count(*),sum(percentage) INTO v_count,v_sum FROM payment_milestones WHERE invoice_id=p_invoice_id;
 IF v_count>0 THEN
  IF v_sum<=0 THEN RAISE EXCEPTION 'Invalid payment schedule'; END IF;
  SELECT id INTO v_last FROM payment_milestones WHERE invoice_id=p_invoice_id ORDER BY due_date DESC,created_at DESC,id DESC LIMIT 1;
  FOR v_pm IN SELECT * FROM payment_milestones WHERE invoice_id=p_invoice_id ORDER BY due_date,created_at,id LOOP
   v_amount := CASE WHEN v_pm.id=v_last THEN v_total-v_allocated ELSE ROUND(v_total::numeric*v_pm.percentage/v_sum)::integer END;
   IF v_amount<=0 THEN RAISE EXCEPTION 'Payment schedule needs manual review'; END IF;
   UPDATE payment_milestones SET amount_cents=v_amount,updated_at=now() WHERE id=v_pm.id;
   v_allocated := v_allocated+v_amount;
  END LOOP;
 ELSE
  SELECT event_date INTO v_date FROM quote_requests WHERE id=v_invoice.quote_request_id;
  IF v_date IS NULL THEN RAISE EXCEPTION 'Event date required for payment schedule'; END IF;
  v_days := v_date - v_today;
  IF v_invoice.payment_schedule_type='net30' OR v_days<=14 THEN
   INSERT INTO payment_milestones(invoice_id,milestone_type,percentage,amount_cents,due_date,is_due_now,is_net30,status,description)
   VALUES(p_invoice_id,'FULL',100,v_total,CASE WHEN v_invoice.payment_schedule_type='net30' THEN v_date+30 ELSE LEAST(v_date,v_today) END,v_invoice.payment_schedule_type IS DISTINCT FROM 'net30',v_invoice.payment_schedule_type='net30','pending','Full payment');
  ELSIF v_days<=30 THEN
   INSERT INTO payment_milestones(invoice_id,milestone_type,percentage,amount_cents,due_date,is_due_now,is_net30,status,description) VALUES
   (p_invoice_id,'DEPOSIT',50,ROUND(v_total*.5),v_today,true,false,'pending','Booking payment (50%) - covers the 10% deposit and 40% milestone'),
   (p_invoice_id,'FINAL',50,v_total-ROUND(v_total*.5),v_date-14,false,false,'pending','Final balance (50%) due 14 days before event');
  ELSE
   INSERT INTO payment_milestones(invoice_id,milestone_type,percentage,amount_cents,due_date,is_due_now,is_net30,status,description) VALUES
   (p_invoice_id,'DEPOSIT',10,ROUND(v_total*.1),v_today,true,false,'pending','10% booking deposit'),
   (p_invoice_id,'MILESTONE',40,ROUND(v_total*.4),v_date-30,false,false,'pending','40% milestone - brings total to 50%'),
   (p_invoice_id,'FINAL',50,v_total-ROUND(v_total*.1)-ROUND(v_total*.4),v_date-14,false,false,'pending','50% final balance');
  END IF;
 END IF;
 IF (SELECT sum(amount_cents) FROM payment_milestones WHERE invoice_id=p_invoice_id)<>v_total THEN RAISE EXCEPTION 'Payment schedule mismatch'; END IF;
 INSERT INTO pricing_suggestion_log(invoice_id,action,tier,previous_items,applied_items,performed_by,basis)
 VALUES(p_invoice_id,CASE WHEN p_tier='undo' THEN 'undo' ELSE 'apply' END,p_tier,v_previous,v_items,p_user_id,jsonb_build_object('undo_of',CASE WHEN p_tier='undo' THEN p_suggestion_id ELSE NULL END)) RETURNING id INTO v_audit;
 UPDATE pricing_suggestion_log SET basis=basis||jsonb_build_object('revision',public.pricing_revision(p_invoice_id)) WHERE id=v_audit;
 RETURN jsonb_build_object('ok',true,'previous',v_previous,'undo_id',v_audit,'total',v_total);
END $function$;