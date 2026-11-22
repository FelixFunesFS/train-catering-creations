-- Rollback-only integration checks. No email or Stripe requests, no retained fixtures.
DO $$
DECLARE
 q quote_requests%ROWTYPE; v_invoice uuid := gen_random_uuid(); v_admin uuid;
 v_line uuid := gen_random_uuid(); v_other uuid := gen_random_uuid(); v_suggestion uuid;
 v_result jsonb; v_basis jsonb; v_items jsonb; v_undo uuid; v_initial integer; v_first_sent timestamptz;
BEGIN
 SELECT user_id INTO v_admin FROM user_roles WHERE role='admin' LIMIT 1;
 IF v_admin IS NULL THEN RAISE EXCEPTION 'QA requires an existing admin role'; END IF;
 SELECT * INTO q FROM quote_requests LIMIT 1;
 IF q.id IS NULL THEN RAISE EXCEPTION 'QA requires one quote as a schema template'; END IF;
 BEGIN
  q.id:=gen_random_uuid(); q.email:='pricing-qa@example.invalid'; q.event_name:='Rollback-only pricing QA'; q.event_date:=current_date+90;
  INSERT INTO quote_requests SELECT q.*;
  INSERT INTO invoices(id,quote_request_id,invoice_number,customer_access_token,workflow_status) VALUES(v_invoice,q.id,'QA-'||v_invoice,gen_random_uuid(),'draft');
  INSERT INTO invoice_line_items(id,invoice_id,title,description,quantity,unit_price,total_price,category) VALUES
   (v_line,v_invoice,'QA package','QA package',10,1000,10000,'package'),
   (v_other,v_invoice,'QA side','QA side',10,100,1000,'side');
  SELECT total_amount INTO v_initial FROM invoices WHERE id=v_invoice;
  v_items:=jsonb_build_array(jsonb_build_object('id',v_line,'unit_price',1200,'expected_price',1000,'expected_quantity',10),jsonb_build_object('id',v_other,'unit_price',200,'expected_price',100,'expected_quantity',10));
  v_basis:=jsonb_build_object('revision',public.pricing_revision(v_invoice),'tiers',jsonb_build_object('recommended',jsonb_build_object('items',v_items)));
  INSERT INTO pricing_suggestion_log(invoice_id,action,performed_by,basis) VALUES(v_invoice,'suggest',v_admin,v_basis) RETURNING id INTO v_suggestion;
  v_result:=public.apply_pricing_suggestion(v_invoice,v_suggestion,'recommended',v_admin);
  IF (SELECT unit_price FROM invoice_line_items WHERE id=v_line)<>1200 OR (SELECT unit_price FROM invoice_line_items WHERE id=v_other)<>200 THEN RAISE EXCEPTION 'QA apply prices failed'; END IF;
  IF (SELECT sum(amount_cents) FROM payment_milestones WHERE invoice_id=v_invoice) IS DISTINCT FROM (SELECT total_amount FROM invoices WHERE id=v_invoice) THEN RAISE EXCEPTION 'QA schedule total failed'; END IF;
  IF (SELECT array_agg(percentage ORDER BY due_date,percentage) FROM payment_milestones WHERE invoice_id=v_invoice) IS DISTINCT FROM ARRAY[10,40,50]::numeric[] THEN RAISE EXCEPTION 'QA 10/40/50 schedule failed'; END IF;
  v_undo:=(v_result->>'undo_id')::uuid;
  PERFORM public.apply_pricing_suggestion(v_invoice,v_undo,'undo',v_admin);
  IF (SELECT total_amount FROM invoices WHERE id=v_invoice)<>v_initial THEN RAISE EXCEPTION 'QA undo total failed'; END IF;
  IF (SELECT sum(amount_cents) FROM payment_milestones WHERE invoice_id=v_invoice) IS DISTINCT FROM v_initial THEN RAISE EXCEPTION 'QA undo schedule failed'; END IF;
  -- Force a later line conflict after the first line has been written; every write must roll back.
  v_items:=jsonb_set(v_items,'{1,expected_price}','999'::jsonb);
  v_basis:=jsonb_build_object('revision',public.pricing_revision(v_invoice),'tiers',jsonb_build_object('recommended',jsonb_build_object('items',v_items)));
  INSERT INTO pricing_suggestion_log(invoice_id,action,performed_by,basis) VALUES(v_invoice,'suggest',v_admin,v_basis) RETURNING id INTO v_suggestion;
  BEGIN
   PERFORM public.apply_pricing_suggestion(v_invoice,v_suggestion,'recommended',v_admin);
   RAISE EXCEPTION 'QA expected line conflict was accepted';
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM NOT LIKE 'Line items changed%' THEN RAISE; END IF;
  END;
  IF (SELECT unit_price FROM invoice_line_items WHERE id=v_line)<>1000 OR (SELECT total_amount FROM invoices WHERE id=v_invoice)<>v_initial OR (SELECT sum(amount_cents) FROM payment_milestones WHERE invoice_id=v_invoice)<>v_initial THEN RAISE EXCEPTION 'QA partial update was not rolled back'; END IF;
  UPDATE invoices SET notes='QA changed composition' WHERE id=v_invoice;
  BEGIN
   PERFORM public.apply_pricing_suggestion(v_invoice,v_suggestion,'recommended',v_admin);
   RAISE EXCEPTION 'QA stale revision accepted';
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM NOT LIKE 'Estimate or pricing settings changed%' THEN RAISE; END IF;
  END;
  UPDATE invoices SET workflow_status='partially_paid' WHERE id=v_invoice;
  BEGIN
   PERFORM public.apply_pricing_suggestion(v_invoice,v_suggestion,'recommended',v_admin);
   RAISE EXCEPTION 'QA paid invoice accepted';
  EXCEPTION WHEN OTHERS THEN
   IF SQLERRM NOT LIKE 'Payment received%' THEN RAISE; END IF;
  END;
  PERFORM public.record_estimate_send(v_invoice);
  SELECT sent_at INTO v_first_sent FROM invoices WHERE id=v_invoice;
  PERFORM public.record_estimate_send(v_invoice);
  IF (SELECT sent_at FROM invoices WHERE id=v_invoice) IS DISTINCT FROM v_first_sent THEN RAISE EXCEPTION 'QA resend changed original validity date'; END IF;
  IF (SELECT workflow_status::text FROM invoices WHERE id=v_invoice)<>'partially_paid' THEN RAISE EXCEPTION 'QA resend regressed payment status'; END IF;
  UPDATE invoices SET sent_at=v_first_sent+interval '8 days' WHERE id=v_invoice;
  IF (SELECT sent_at FROM invoices WHERE id=v_invoice) IS DISTINCT FROM v_first_sent THEN RAISE EXCEPTION 'QA legacy resend writer extended validity'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZQ001',MESSAGE='QA_ROLLBACK_SUCCESS';
 EXCEPTION WHEN SQLSTATE 'ZQ001' THEN
  RAISE NOTICE 'PASS: atomic apply, 10/40/50 schedule, undo, partial failure rollback, stale revision, paid lock, original sent date and no status regression; fixtures rolled back';
 END;
 IF EXISTS(SELECT 1 FROM invoices WHERE id=v_invoice) OR EXISTS(SELECT 1 FROM quote_requests WHERE id=q.id) THEN RAISE EXCEPTION 'QA fixtures were not rolled back'; END IF;
END $$;