-- Add Terms & Conditions and contract bypass fields to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS include_terms_and_conditions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_separate_contract boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone DEFAULT NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN public.invoices.include_terms_and_conditions IS 'Whether to include T&C in the estimate email';
COMMENT ON COLUMN public.invoices.requires_separate_contract IS 'Whether this event requires a separate contract document (auto-set for weddings/govt, can be overridden by admin)';
COMMENT ON COLUMN public.invoices.terms_accepted_at IS 'Timestamp when customer accepted T&C via estimate (if no separate contract required)';

-- Create index for queries filtering by contract requirement
CREATE INDEX IF NOT EXISTS idx_invoices_requires_contract ON public.invoices(requires_separate_contract);

-- Add contract bypass tracking to analytics
COMMENT ON COLUMN public.invoices.terms_accepted_at IS 'When customer accepted Terms & Conditions via estimate approval (bypassing separate contract)';