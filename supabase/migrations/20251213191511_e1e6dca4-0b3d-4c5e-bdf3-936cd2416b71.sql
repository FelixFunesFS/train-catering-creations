-- Add discount support columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount integer DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_type text CHECK (discount_type IN ('percentage', 'fixed', NULL));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_description text;

-- Add comment for clarity
COMMENT ON COLUMN invoices.discount_amount IS 'Discount in cents (if fixed) or percentage points (if percentage)';
COMMENT ON COLUMN invoices.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN invoices.discount_description IS 'Description for the discount e.g. Military Discount, Early Bird';