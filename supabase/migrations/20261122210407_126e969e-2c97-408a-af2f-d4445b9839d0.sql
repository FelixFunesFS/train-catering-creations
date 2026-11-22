DO $$
DECLARE v_definition text;
BEGIN
 SELECT pg_get_functiondef('public.apply_pricing_suggestion(uuid,uuid,text,uuid)'::regprocedure) INTO v_definition;
 IF strpos(v_definition,' PERFORM id FROM quote_requests WHERE id=v_invoice.quote_request_id FOR UPDATE;')=0 OR strpos(v_definition,'SELECT count(*),sum(amount_cents) INTO v_count,v_sum')=0 THEN
  RAISE EXCEPTION 'Unexpected pricing function definition; no change applied';
 END IF;
 v_definition:=replace(v_definition,' PERFORM id FROM quote_requests WHERE id=v_invoice.quote_request_id FOR UPDATE;',' LOCK TABLE public.pricing_rules, public.pricing_adjustments, public.business_config IN SHARE MODE;'||chr(10)||' PERFORM id FROM quote_requests WHERE id=v_invoice.quote_request_id FOR UPDATE;');
 v_definition:=replace(v_definition,'v_total integer; v_sum bigint;','v_total integer; v_sum numeric;');
 v_definition:=replace(v_definition,'SELECT count(*),sum(amount_cents) INTO v_count,v_sum','SELECT count(*),sum(percentage) INTO v_count,v_sum');
 v_definition:=replace(v_definition,'v_total::numeric*v_pm.amount_cents/v_sum','v_total::numeric*v_pm.percentage/v_sum');
 EXECUTE v_definition;
END $$;