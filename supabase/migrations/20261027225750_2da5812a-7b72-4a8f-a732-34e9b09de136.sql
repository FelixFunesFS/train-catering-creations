CREATE OR REPLACE FUNCTION public.get_staff_invoice_links(_quote_ids uuid[])
RETURNS TABLE(id uuid, quote_request_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id, i.quote_request_id FROM public.invoices i
  WHERE i.quote_request_id = ANY(_quote_ids)
    AND (public.has_role(auth.uid(), 'staff'::user_role) OR public.is_admin());
$$;
REVOKE ALL ON FUNCTION public.get_staff_invoice_links(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_staff_invoice_links(uuid[]) TO authenticated;