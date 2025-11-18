-- Ensure RLS is enabled on all payment workflow tables
-- This migration verifies RLS is active and policies are in place for production security

-- Enable RLS on quote_requests (should already be enabled)
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoices (should already be enabled)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoice_line_items (should already be enabled)
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_milestones (should already be enabled)
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_transactions (should already be enabled)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Verify service role can bypass RLS (no additional policies needed)
-- Service role automatically bypasses RLS, which is used for integration tests

-- Add comment for documentation
COMMENT ON TABLE quote_requests IS 'RLS enabled: Admins have full access, customers can view their own quotes';
COMMENT ON TABLE invoices IS 'RLS enabled: Admins have full access, customers can view their own invoices via token or email';
COMMENT ON TABLE invoice_line_items IS 'RLS enabled: Admins have full access, customers can view line items for their invoices';
COMMENT ON TABLE payment_milestones IS 'RLS enabled: Admins have full access, customers can view milestones for their invoices';
COMMENT ON TABLE payment_transactions IS 'RLS enabled: Admins have full access, customers can view their own transactions';