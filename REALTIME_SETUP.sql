-- Enable real-time for customer-facing tables
-- This allows customers to see updates to their estimates and change requests in real-time

-- Enable realtime for invoices table
ALTER TABLE invoices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

-- Enable realtime for change_requests table
ALTER TABLE change_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE change_requests;

-- Enable realtime for payment_milestones table (for payment status updates)
ALTER TABLE payment_milestones REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_milestones;

-- Enable realtime for quote_requests table (for quote status updates)
ALTER TABLE quote_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE quote_requests;

-- Note: Real-time subscriptions respect RLS policies
-- Customers can only receive updates for records they have access to
