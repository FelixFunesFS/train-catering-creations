-- Add missing workflow status values
DO $$ 
BEGIN
  -- Add awaiting_payment to quote_workflow_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'awaiting_payment' 
    AND enumtypid = 'quote_workflow_status'::regtype
  ) THEN
    ALTER TYPE quote_workflow_status ADD VALUE 'awaiting_payment';
  END IF;

  -- Add paid to quote_workflow_status if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'paid' 
    AND enumtypid = 'quote_workflow_status'::regtype
  ) THEN
    ALTER TYPE quote_workflow_status ADD VALUE 'paid';
  END IF;

  -- Add payment_pending to invoice_workflow_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'payment_pending' 
    AND enumtypid = 'invoice_workflow_status'::regtype
  ) THEN
    ALTER TYPE invoice_workflow_status ADD VALUE 'payment_pending';
  END IF;

  -- Add partially_paid to invoice_workflow_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'partially_paid' 
    AND enumtypid = 'invoice_workflow_status'::regtype
  ) THEN
    ALTER TYPE invoice_workflow_status ADD VALUE 'partially_paid';
  END IF;
END $$;