-- 1. submission_failures: lost lead recovery
CREATE TABLE public.submission_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_stage text NOT NULL,
  form_type text,
  contact_name text,
  email text,
  phone text,
  partial_payload jsonb DEFAULT '{}'::jsonb,
  error_message text,
  error_details jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  url text,
  session_id text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by text,
  admin_notes text,
  converted_to_quote_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_failures_created_at ON public.submission_failures (created_at DESC);
CREATE INDEX idx_submission_failures_resolved ON public.submission_failures (resolved, created_at DESC);
CREATE INDEX idx_submission_failures_email ON public.submission_failures (email);
CREATE INDEX idx_submission_failures_stage ON public.submission_failures (failure_stage);

ALTER TABLE public.submission_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view submission failures"
  ON public.submission_failures FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update submission failures"
  ON public.submission_failures FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete submission failures"
  ON public.submission_failures FOR DELETE
  TO authenticated
  USING (is_admin());

-- No INSERT policy — only service role (edge functions) can insert.

CREATE TRIGGER update_submission_failures_updated_at
  BEFORE UPDATE ON public.submission_failures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. email_send_log: single source of truth for email delivery
CREATE TABLE public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  template_name text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_send_log_message_id ON public.email_send_log (message_id, created_at DESC);
CREATE INDEX idx_email_send_log_created_at ON public.email_send_log (created_at DESC);
CREATE INDEX idx_email_send_log_status ON public.email_send_log (status, created_at DESC);
CREATE INDEX idx_email_send_log_template ON public.email_send_log (template_name);
CREATE INDEX idx_email_send_log_recipient ON public.email_send_log (recipient_email);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email send log"
  ON public.email_send_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- No INSERT/UPDATE/DELETE policies for clients — service role only.

-- 3. form_analytics_events: drop-off and abandonment tracking
CREATE TABLE public.form_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  form_type text,
  session_id text NOT NULL,
  step_number integer,
  step_name text,
  field_name text,
  time_on_step_seconds integer,
  total_time_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_analytics_session ON public.form_analytics_events (session_id, created_at);
CREATE INDEX idx_form_analytics_event_type ON public.form_analytics_events (event_type, created_at DESC);
CREATE INDEX idx_form_analytics_created_at ON public.form_analytics_events (created_at DESC);
CREATE INDEX idx_form_analytics_form_type ON public.form_analytics_events (form_type, event_type);

ALTER TABLE public.form_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view form analytics"
  ON public.form_analytics_events FOR SELECT
  TO authenticated
  USING (is_admin());

-- No INSERT/UPDATE/DELETE policies for clients — service role only.