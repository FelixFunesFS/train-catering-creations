-- Enable realtime for change_requests table
ALTER TABLE public.change_requests REPLICA IDENTITY FULL;

-- Add change_requests to the realtime publication 
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_requests;