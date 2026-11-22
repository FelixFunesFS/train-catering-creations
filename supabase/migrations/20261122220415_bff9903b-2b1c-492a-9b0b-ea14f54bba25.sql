CREATE OR REPLACE FUNCTION public.recalculate_milestone_amounts()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_paid bigint; v_remaining bigint; v_pct_sum numeric; v_used bigint := 0;
  v_last uuid; r record;
BEGIN
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount AND NEW.total_amount > 0 THEN
    SELECT COALESCE(SUM(amount_cents),0) INTO v_paid FROM payment_milestones WHERE invoice_id = NEW.id AND status = 'paid';
    SELECT COALESCE(SUM(percentage),0) INTO v_pct_sum FROM payment_milestones WHERE invoice_id = NEW.id AND status IS DISTINCT FROM 'paid';
    IF v_pct_sum <= 0 THEN RETURN NEW; END IF;
    v_remaining := GREATEST(NEW.total_amount - v_paid, 0);
    SELECT id INTO v_last FROM payment_milestones WHERE invoice_id = NEW.id AND status IS DISTINCT FROM 'paid'
      ORDER BY due_date DESC NULLS LAST, created_at DESC LIMIT 1;
    -- Unpaid steps share what is still owed by their percentages; the last step absorbs rounding
    FOR r IN SELECT id, percentage FROM payment_milestones WHERE invoice_id = NEW.id AND status IS DISTINCT FROM 'paid' AND id <> v_last LOOP
      UPDATE payment_milestones SET amount_cents = ROUND(v_remaining * r.percentage / v_pct_sum), updated_at = now() WHERE id = r.id;
      v_used := v_used + ROUND(v_remaining * r.percentage / v_pct_sum);
    END LOOP;
    UPDATE payment_milestones SET amount_cents = v_remaining - v_used, updated_at = now() WHERE id = v_last;
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.recalculate_milestone_amounts() FROM PUBLIC, anon, authenticated;