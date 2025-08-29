-- Fix RLS policies for admin access to message tables
DROP POLICY IF EXISTS "Admin can manage message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Admin can manage admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admin can manage messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can manage history" ON public.quote_request_history;

-- Create proper RLS policies for admin access
CREATE POLICY "Admin can manage message threads" ON public.message_threads
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage admin notes" ON public.admin_notes
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage messages" ON public.messages
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage history" ON public.quote_request_history
FOR ALL
USING (true)
WITH CHECK (true);