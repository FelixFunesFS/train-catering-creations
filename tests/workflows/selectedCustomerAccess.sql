-- Rollback-only checks for the seven selected access policies.
DO $$
DECLARE
 q quote_requests%ROWTYPE; v_invoice uuid:=gen_random_uuid(); v_token uuid:=gen_random_uuid();
 v_admin uuid; v_id uuid; v_count integer; v_rejected boolean;
BEGIN
 SELECT * INTO q FROM quote_requests LIMIT 1;
 SELECT user_id INTO v_admin FROM user_roles WHERE role='admin' LIMIT 1;
 IF q.id IS NULL OR v_admin IS NULL THEN RAISE EXCEPTION 'Access QA needs an existing schema template and admin'; END IF;
 BEGIN
  q.id:=gen_random_uuid(); q.email:='selected-access-qa@example.invalid'; q.event_name:='Rollback-only selected access QA';
  INSERT INTO quote_requests SELECT q.*;
  INSERT INTO invoices(id,quote_request_id,customer_access_token,token_expires_at,invoice_number) VALUES(v_invoice,q.id,v_token,now()+interval '1 day','QA-'||v_invoice);
  INSERT INTO invoice_line_items(invoice_id,description,quantity,unit_price,total_price) VALUES(v_invoice,'QA',1,1000,1000);
  INSERT INTO payment_milestones(invoice_id,milestone_type,percentage,amount_cents,status) VALUES(v_invoice,'FULL',100,1090,'pending');
  INSERT INTO estimate_versions(invoice_id,version_number,status,line_items,subtotal,tax_amount,total_amount,created_by) VALUES(v_invoice,1,'draft','[]',1000,90,1090,'QA');
  INSERT INTO change_requests(invoice_id,customer_email,request_type,requested_changes) VALUES(v_invoice,q.email,'modification','{}');
  PERFORM set_config('request.headers',jsonb_build_object('authorization',v_token::text,'x-customer-token',v_token::text)::text,true);
  PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
  SET LOCAL ROLE anon;
  SELECT (SELECT count(*) FROM invoices WHERE id=v_invoice)+(SELECT count(*) FROM invoice_line_items WHERE invoice_id=v_invoice)+(SELECT count(*) FROM payment_milestones WHERE invoice_id=v_invoice)+(SELECT count(*) FROM estimate_versions WHERE invoice_id=v_invoice)+(SELECT count(*) FROM change_requests WHERE invoice_id=v_invoice) INTO v_count;
  IF v_count<>0 THEN RAISE EXCEPTION 'Forged headers exposed protected rows'; END IF;
  SELECT count(*) INTO v_count FROM get_estimate_with_line_items(v_token::text);
  IF v_count<>1 THEN RAISE EXCEPTION 'Valid anonymous portal access broken'; END IF;
  v_rejected:=false;
  BEGIN
   INSERT INTO change_requests(invoice_id,customer_email,request_type,requested_changes,workflow_status) VALUES(v_invoice,'forged@example.invalid','modification','{}','approved');
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Anonymous direct change insert allowed'; END IF;
  v_rejected:=false;
  BEGIN
   INSERT INTO quote_requests SELECT q.*;
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Anonymous direct quote insert allowed'; END IF;
  v_rejected:=false;
  BEGIN
   PERFORM submit_customer_change_request(v_invoice,'modification','{}','QA','medium',v_token::text);
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Service-only helper callable anonymously'; END IF;
  RESET ROLE;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated','email','other-access-qa@example.invalid')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT (SELECT count(*) FROM invoices WHERE id=v_invoice)+(SELECT count(*) FROM invoice_line_items WHERE invoice_id=v_invoice)+(SELECT count(*) FROM payment_milestones WHERE invoice_id=v_invoice)+(SELECT count(*) FROM estimate_versions WHERE invoice_id=v_invoice)+(SELECT count(*) FROM change_requests WHERE invoice_id=v_invoice) INTO v_count;
  IF v_count<>0 THEN RAISE EXCEPTION 'Unrelated signed-in customer read allowed'; END IF;
  v_rejected:=false;
  BEGIN
   INSERT INTO change_requests(invoice_id,customer_email,request_type,requested_changes) VALUES(v_invoice,q.email,'modification','{}');
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Non-admin direct change insert allowed'; END IF;
  v_rejected:=false;
  BEGIN
   INSERT INTO quote_requests SELECT q.*;
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Non-admin direct quote insert allowed'; END IF;
  RESET ROLE;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',gen_random_uuid(),'role','authenticated','email',q.email)::text,true);
  SET LOCAL ROLE authenticated;
  SELECT (SELECT count(*) FROM invoices WHERE id=v_invoice)+(SELECT count(*) FROM invoice_line_items WHERE invoice_id=v_invoice)+(SELECT count(*) FROM payment_milestones WHERE invoice_id=v_invoice)+(SELECT count(*) FROM estimate_versions WHERE invoice_id=v_invoice)+(SELECT count(*) FROM change_requests WHERE invoice_id=v_invoice) INTO v_count;
  IF v_count<>5 THEN RAISE EXCEPTION 'Verified customer ownership reads broken'; END IF;
  RESET ROLE;
  PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
  v_id:=submit_customer_change_request(v_invoice,'modification','{"details":"QA"}','QA','medium',v_token::text);
  IF NOT EXISTS(SELECT 1 FROM change_requests WHERE id=v_id AND invoice_id=v_invoice AND customer_email=q.email AND workflow_status='pending' AND admin_response IS NULL) THEN RAISE EXCEPTION 'Server-owned change identity/status failed'; END IF;
  v_rejected:=false;
  BEGIN
   PERFORM submit_customer_change_request(v_invoice,'modification','{}','QA','medium',gen_random_uuid()::text);
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Wrong token accepted'; END IF;
  UPDATE invoices SET token_expires_at=now()-interval '1 day' WHERE id=v_invoice;
  v_rejected:=false;
  BEGIN
   PERFORM submit_customer_change_request(v_invoice,'modification','{}','QA','medium',v_token::text);
  EXCEPTION WHEN insufficient_privilege THEN v_rejected:=true; END;
  IF NOT v_rejected THEN RAISE EXCEPTION 'Expired token accepted'; END IF;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',v_admin,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM invoices WHERE id=v_invoice;
  IF v_count<>1 THEN RAISE EXCEPTION 'Admin invoice access broken'; END IF;
  INSERT INTO change_requests(invoice_id,customer_email,request_type,requested_changes) VALUES(v_invoice,q.email,'modification','{}');
  q.id:=gen_random_uuid(); INSERT INTO quote_requests SELECT q.*;
  RESET ROLE;
  RAISE EXCEPTION USING ERRCODE='ZQ002',MESSAGE='ACCESS_QA_ROLLBACK';
 EXCEPTION WHEN SQLSTATE 'ZQ002' THEN
  RAISE NOTICE 'PASS: forged-header denial, direct-insert denial, owner reads, valid portal link, token expiry, server-owned submissions and admin access; all fixtures rolled back';
 END;
 IF EXISTS(SELECT 1 FROM invoices WHERE id=v_invoice) THEN RAISE EXCEPTION 'QA fixture retained'; END IF;
END $$;