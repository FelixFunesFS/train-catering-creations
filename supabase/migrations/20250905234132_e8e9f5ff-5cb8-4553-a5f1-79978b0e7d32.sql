-- Fix security issues by setting proper search paths for functions

-- Fix function search path for validate_payment_transaction
CREATE OR REPLACE FUNCTION validate_payment_transaction() 
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure amount is never null
  IF NEW.amount IS NULL THEN
    RAISE EXCEPTION 'Payment transaction amount cannot be null';
  END IF;
  
  -- Ensure amount is positive
  IF NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payment transaction amount must be positive';
  END IF;
  
  -- Ensure customer email is provided
  IF NEW.customer_email IS NULL OR NEW.customer_email = '' THEN
    RAISE EXCEPTION 'Payment transaction must have customer email';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;