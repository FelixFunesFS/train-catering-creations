-- Create analytics_events table for comprehensive tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin can view analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create policy for edge functions to insert events
CREATE POLICY "Edge functions can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_entity ON public.analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);

-- Add estimate view tracking columns to invoices table (if not exists)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS estimate_viewed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimate_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_customer_action TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_feedback JSONB DEFAULT '{}';

-- Add customer interaction tracking to quote_requests
ALTER TABLE public.quote_requests
ADD COLUMN IF NOT EXISTS last_customer_interaction TIMESTAMPTZ;