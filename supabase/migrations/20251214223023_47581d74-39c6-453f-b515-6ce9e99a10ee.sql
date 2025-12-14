-- Create trigger to recalculate milestone amounts when invoice total changes
CREATE OR REPLACE FUNCTION public.recalculate_milestone_amounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only recalculate if total_amount changed
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
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

-- Create the trigger on invoices table
DROP TRIGGER IF EXISTS trigger_recalculate_milestone_amounts ON invoices;
CREATE TRIGGER trigger_recalculate_milestone_amounts
  AFTER UPDATE OF total_amount ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_milestone_amounts();