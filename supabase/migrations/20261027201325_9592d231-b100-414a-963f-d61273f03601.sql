CREATE OR REPLACE FUNCTION public.confirm_my_staff_assignment(_assignment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name text; _email text; _full text; _hay1 text; _hay2 text; _token text;
  _ok1 boolean := true; _ok2 boolean := true; _count int := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT staff_name INTO _name FROM public.staff_assignments WHERE id = _assignment_id;
  IF _name IS NULL THEN RAISE EXCEPTION 'Shift not found'; END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    SELECT email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
      INTO _email, _full FROM auth.users WHERE id = auth.uid();
    _hay1 := regexp_replace(lower(coalesce(_full, '')), '[^a-z0-9]', '', 'g');
    _hay2 := regexp_replace(lower(split_part(coalesce(_email, ''), '@', 1)), '[^a-z0-9]', '', 'g');
    FOREACH _token IN ARRAY regexp_split_to_array(lower(_name), '\s+') LOOP
      _token := regexp_replace(_token, '[^a-z0-9]', '', 'g');
      CONTINUE WHEN length(_token) < 3;
      _count := _count + 1;
      IF _hay1 = '' OR position(_token IN _hay1) = 0 THEN _ok1 := false; END IF;
      IF _hay2 = '' OR position(_token IN _hay2) = 0 THEN _ok2 := false; END IF;
    END LOOP;
    IF _count = 0 OR NOT (_ok1 OR _ok2) THEN RAISE EXCEPTION 'This shift is not assigned to you'; END IF;
  END IF;
  UPDATE public.staff_assignments SET confirmed = true, updated_at = now() WHERE id = _assignment_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_my_staff_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_my_staff_assignment(uuid) TO authenticated;