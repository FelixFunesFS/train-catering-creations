-- Staff SELECT-only policies for invoice_line_items and admin_notes

-- invoice_line_items: staff can read (app layer excludes pricing columns)
CREATE POLICY "Staff can read invoice line items"
ON public.invoice_line_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- admin_notes: staff can read operational notes
CREATE POLICY "Staff can read admin notes"
ON public.admin_notes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'staff'));