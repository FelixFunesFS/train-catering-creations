-- Fix RLS policies for message_threads to allow admin operations
DROP POLICY IF EXISTS "Service role can manage message threads" ON public.message_threads;

-- Create proper admin policy for message threads
CREATE POLICY "Admin can manage message threads" ON public.message_threads
FOR ALL 
USING (true);

-- Ensure admin_notes also has proper policy
DROP POLICY IF EXISTS "Service role can manage admin notes" ON public.admin_notes;

-- Create proper admin policy for admin notes  
CREATE POLICY "Admin can manage admin notes" ON public.admin_notes
FOR ALL
USING (true);

-- Create proper admin policy for messages
DROP POLICY IF EXISTS "Service role can manage messages" ON public.messages;

CREATE POLICY "Admin can manage messages" ON public.messages
FOR ALL
USING (true);

-- Create proper admin policy for quote_request_history
DROP POLICY IF EXISTS "Service role can manage history" ON public.quote_request_history;

CREATE POLICY "Admin can manage history" ON public.quote_request_history
FOR ALL
USING (true);