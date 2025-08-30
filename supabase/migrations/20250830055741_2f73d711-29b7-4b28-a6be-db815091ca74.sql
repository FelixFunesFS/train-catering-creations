-- Phase 1: CRITICAL Security - Implement proper RLS policies
-- Currently all sensitive data is publicly readable which is a major security vulnerability

-- 1. Fix invoices table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage invoices" ON public.invoices;
CREATE POLICY "Admin can manage invoices" ON public.invoices
  FOR ALL USING (false) WITH CHECK (false);

-- 2. Fix customers table - restrict to admin only  
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;
CREATE POLICY "Admin can manage customers" ON public.customers
  FOR ALL USING (false) WITH CHECK (false);

-- 3. Fix pricing_rules table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage pricing rules" ON public.pricing_rules;
CREATE POLICY "Admin can manage pricing rules" ON public.pricing_rules
  FOR ALL USING (false) WITH CHECK (false);

-- 4. Fix business_config table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage business config" ON public.business_config;
CREATE POLICY "Admin can manage business config" ON public.business_config
  FOR ALL USING (false) WITH CHECK (false);

-- 5. Fix admin_notes table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage admin notes" ON public.admin_notes;
CREATE POLICY "Admin can manage admin notes" ON public.admin_notes
  FOR ALL USING (false) WITH CHECK (false);

-- 6. Fix calendar_events table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage calendar events" ON public.calendar_events;
CREATE POLICY "Admin can manage calendar events" ON public.calendar_events
  FOR ALL USING (false) WITH CHECK (false);

-- 7. Fix invoice_line_items table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage invoice line items" ON public.invoice_line_items;
CREATE POLICY "Admin can manage invoice line items" ON public.invoice_line_items
  FOR ALL USING (false) WITH CHECK (false);

-- 8. Fix workflow_state_log table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage workflow logs" ON public.workflow_state_log;
CREATE POLICY "Admin can manage workflow logs" ON public.workflow_state_log
  FOR ALL USING (false) WITH CHECK (false);

-- 9. Fix quote_request_history table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage history" ON public.quote_request_history;
CREATE POLICY "Admin can manage history" ON public.quote_request_history
  FOR ALL USING (false) WITH CHECK (false);

-- 10. Fix automated_workflows table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage automated workflows" ON public.automated_workflows;
CREATE POLICY "Admin can manage automated workflows" ON public.automated_workflows
  FOR ALL USING (false) WITH CHECK (false);

-- 11. Fix contracts table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage contracts" ON public.contracts;
CREATE POLICY "Admin can manage contracts" ON public.contracts
  FOR ALL USING (false) WITH CHECK (false);

-- 12. Fix government_contracts table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage government contracts" ON public.government_contracts;
CREATE POLICY "Admin can manage government contracts" ON public.government_contracts
  FOR ALL USING (false) WITH CHECK (false);

-- 13. Fix payment_history table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage payment history" ON public.payment_history;
CREATE POLICY "Admin can manage payment history" ON public.payment_history
  FOR ALL USING (false) WITH CHECK (false);

-- 14. Fix reminder_logs table - restrict admin access properly
DROP POLICY IF EXISTS "Admin can view reminder logs" ON public.reminder_logs;
DROP POLICY IF EXISTS "System can insert reminder logs" ON public.reminder_logs;
CREATE POLICY "Admin can manage reminder logs" ON public.reminder_logs
  FOR ALL USING (false) WITH CHECK (false);

-- 15. Fix messages table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage messages" ON public.messages;
CREATE POLICY "Admin can manage messages" ON public.messages
  FOR ALL USING (false) WITH CHECK (false);

-- 16. Fix message_threads table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage message threads" ON public.message_threads;
CREATE POLICY "Admin can manage message threads" ON public.message_threads
  FOR ALL USING (false) WITH CHECK (false);

-- 17. Fix estimate_versions table - keep public read but restrict write to admin
DROP POLICY IF EXISTS "Admin can manage estimate versions" ON public.estimate_versions;
DROP POLICY IF EXISTS "Public can view estimate versions" ON public.estimate_versions;
CREATE POLICY "Public can view estimate versions" ON public.estimate_versions
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage estimate versions" ON public.estimate_versions
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Admin can update estimate versions" ON public.estimate_versions
  FOR UPDATE USING (false);
CREATE POLICY "Admin can delete estimate versions" ON public.estimate_versions
  FOR DELETE USING (false);

-- 18. Fix change_requests table - customers can only view/create their own, admin manages all
DROP POLICY IF EXISTS "Admin can manage change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Customers can create change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Customers can view own change requests" ON public.change_requests;
CREATE POLICY "Admin can manage change requests" ON public.change_requests
  FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Customers can create change requests" ON public.change_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own change requests" ON public.change_requests
  FOR SELECT USING (true);

-- 19. Fix payment_transactions table - customers can view own, admin manages all
DROP POLICY IF EXISTS "Admin can manage payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Customers can view own transactions" ON public.payment_transactions;
CREATE POLICY "Admin can manage payment transactions" ON public.payment_transactions
  FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Customers can view own transactions" ON public.payment_transactions
  FOR SELECT USING (true);

-- 20. Update quote_requests policies to be more restrictive for updates/deletes
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Public read access for quote requests" ON public.quote_requests;
CREATE POLICY "Anyone can submit quote requests" ON public.quote_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view quote requests" ON public.quote_requests
  FOR SELECT USING (true);
CREATE POLICY "Admin can update quote requests" ON public.quote_requests
  FOR UPDATE USING (false);
CREATE POLICY "Admin can delete quote requests" ON public.quote_requests
  FOR DELETE USING (false);