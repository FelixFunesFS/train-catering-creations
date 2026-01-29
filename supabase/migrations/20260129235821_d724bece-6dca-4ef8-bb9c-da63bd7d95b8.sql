-- Table 1: Push subscriptions for Web Push notifications
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins only
CREATE POLICY "Admins can manage push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Table 2: Admin notification preferences
CREATE TABLE public.admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  visitor_alerts BOOLEAN NOT NULL DEFAULT false,
  quote_alerts BOOLEAN NOT NULL DEFAULT true,
  payment_alerts BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own preferences
CREATE POLICY "Users can view own notification preferences"
ON public.admin_notification_preferences
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
ON public.admin_notification_preferences
FOR INSERT
WITH CHECK (user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own notification preferences"
ON public.admin_notification_preferences
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to update updated_at
CREATE TRIGGER update_admin_notification_preferences_updated_at
  BEFORE UPDATE ON public.admin_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_admin_notification_preferences_user_id ON public.admin_notification_preferences(user_id);