CREATE TABLE public.pricing_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_date date NOT NULL,
  scope text NOT NULL DEFAULT 'all',
  scope_value text,
  adjustment_type text NOT NULL DEFAULT 'flat',
  amount numeric NOT NULL,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_adjustments TO authenticated;
GRANT ALL ON public.pricing_adjustments TO service_role;
ALTER TABLE public.pricing_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pricing adjustments" ON public.pricing_adjustments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.pricing_suggestion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  action text NOT NULL,
  tier text,
  previous_items jsonb,
  applied_items jsonb,
  basis jsonb,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_suggestion_log TO authenticated;
GRANT ALL ON public.pricing_suggestion_log TO service_role;
ALTER TABLE public.pricing_suggestion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read pricing log" ON public.pricing_suggestion_log FOR SELECT TO authenticated USING (public.is_admin());

INSERT INTO public.business_config (config_key, config_value)
SELECT 'pricing_floors', '{"per_head_cents": 1500, "minimum_order_cents": 50000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.business_config WHERE config_key = 'pricing_floors');