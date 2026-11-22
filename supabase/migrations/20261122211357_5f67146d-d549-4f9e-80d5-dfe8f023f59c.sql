ALTER POLICY "secure_invoice_line_items_customer_read" ON public.invoice_line_items TO authenticated USING (
 auth.uid() IS NOT NULL AND invoice_id IN (SELECT i.id FROM public.invoices i JOIN public.quote_requests q ON q.id=i.quote_request_id WHERE q.email=auth.jwt()->>'email')
);
ALTER POLICY "secure_estimate_versions_customer_read" ON public.estimate_versions TO authenticated USING (
 auth.uid() IS NOT NULL AND invoice_id IN (SELECT i.id FROM public.invoices i JOIN public.quote_requests q ON q.id=i.quote_request_id WHERE q.email=auth.jwt()->>'email')
);
ALTER POLICY "secure_change_requests_customer_access" ON public.change_requests TO authenticated USING (
 auth.uid() IS NOT NULL AND customer_email=auth.jwt()->>'email'
);
ALTER POLICY "Token based invoice access" ON public.invoices TO authenticated USING (
 auth.uid() IS NOT NULL AND quote_request_id IN (SELECT q.id FROM public.quote_requests q WHERE q.email=auth.jwt()->>'email')
);
ALTER POLICY "secure_payment_milestones_customer_read" ON public.payment_milestones TO authenticated USING (
 auth.uid() IS NOT NULL AND invoice_id IN (SELECT i.id FROM public.invoices i JOIN public.quote_requests q ON q.id=i.quote_request_id WHERE q.email=auth.jwt()->>'email')
);
ALTER POLICY "Anyone can submit quote requests" ON public.quote_requests TO authenticated WITH CHECK (public.is_admin());
ALTER POLICY "Customers can create change requests" ON public.change_requests TO authenticated WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.submit_customer_change_request(p_invoice_id uuid,p_request_type text,p_requested_changes jsonb,p_customer_comments text DEFAULT NULL,p_priority text DEFAULT 'medium',p_access_token text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_email text; v_id uuid;
BEGIN
 IF p_request_type IS NULL OR p_request_type NOT IN ('modification','cancellation','date_change','guest_count_change') OR p_priority IS NULL OR p_priority NOT IN ('low','medium','high','urgent') THEN
  RAISE EXCEPTION 'Invalid change request' USING ERRCODE='22023';
 END IF;
 IF p_requested_changes IS NULL OR jsonb_typeof(p_requested_changes)<>'object' OR octet_length(p_requested_changes::text)>20000 OR length(COALESCE(p_customer_comments,''))>5000 THEN
  RAISE EXCEPTION 'Invalid change request details' USING ERRCODE='22023';
 END IF;
 SELECT q.email INTO v_email FROM public.invoices i JOIN public.quote_requests q ON q.id=i.quote_request_id
 WHERE i.id=p_invoice_id AND (
  (i.customer_access_token::text=p_access_token AND (i.token_expires_at IS NULL OR i.token_expires_at>now()))
  OR public.is_admin()
 ) FOR SHARE OF i;
 IF v_email IS NULL THEN RAISE EXCEPTION 'Invalid or expired estimate link' USING ERRCODE='42501'; END IF;
 INSERT INTO public.change_requests(invoice_id,customer_email,request_type,requested_changes,customer_comments,priority,workflow_status)
 VALUES(p_invoice_id,v_email,p_request_type,p_requested_changes,p_customer_comments,p_priority,'pending') RETURNING id INTO v_id;
 RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_customer_change_request(uuid,text,jsonb,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_customer_change_request(uuid,text,jsonb,text,text,text) TO anon,authenticated,service_role;
COMMENT ON FUNCTION public.submit_customer_change_request(uuid,text,jsonb,text,text,text) IS 'Intentionally callable by public customers: requires invoice-bound unexpired token or verified admin; derives email and pending status server-side; accepts no privileged fields.';