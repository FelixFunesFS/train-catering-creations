CREATE OR REPLACE FUNCTION public.recalculate_milestone_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only recalculate if total_amount changed AND is not zero
  -- (Zero occurs during transient state when line items are being replaced)
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount 
     AND NEW.total_amount > 0 THEN
    -- Update all milestone amounts proportionally based on percentage
    UPDATE payment_milestones
    SET 
      amount_cents = ROUND(NEW.total_amount * percentage / 100),
      updated_at = NOW()
    WHERE invoice_id = NEW.id
      AND status != 'paid'; -- Don't modify paid milestones
  END IF;
  
  RETURN NEW;
END;
$$;