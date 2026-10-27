CREATE OR REPLACE FUNCTION public.staff_name_aliases(_t text)
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _t IN ('mike','mikey','michael') THEN ARRAY['mike','michael']
    WHEN _t IN ('bob','rob','robbie','robert') THEN ARRAY['bob','rob','robert']
    WHEN _t IN ('bill','will','billy','william') THEN ARRAY['bill','will','william']
    WHEN _t IN ('jim','jimmy','james') THEN ARRAY['jim','jimmy','james']
    WHEN _t IN ('tony','anthony') THEN ARRAY['tony','anthony']
    WHEN _t IN ('chris','christopher','christina','christine') THEN ARRAY['chris','christopher','christina','christine']
    WHEN _t IN ('liz','beth','elizabeth') THEN ARRAY['liz','beth','elizabeth']
    WHEN _t IN ('kate','katie','kathy','katherine','catherine') THEN ARRAY['kate','katie','kathy','katherine','catherine']
    WHEN _t IN ('dan','danny','daniel') THEN ARRAY['dan','danny','daniel']
    WHEN _t IN ('joe','joey','joseph') THEN ARRAY['joe','joey','joseph']
    WHEN _t IN ('tom','tommy','thomas') THEN ARRAY['tom','tommy','thomas']
    WHEN _t IN ('dave','david') THEN ARRAY['dave','david']
    WHEN _t IN ('steve','steven','stephen') THEN ARRAY['steve','steven','stephen']
    WHEN _t IN ('matt','matthew') THEN ARRAY['matt','matthew']
    WHEN _t IN ('nick','nicholas') THEN ARRAY['nick','nicholas']
    WHEN _t IN ('sam','samuel','samantha') THEN ARRAY['sam','samuel','samantha']
    WHEN _t IN ('alex','alexander','alexandra') THEN ARRAY['alex','alexander','alexandra']
    WHEN _t IN ('jen','jenny','jennifer') THEN ARRAY['jen','jenny','jennifer']
    WHEN _t IN ('pat','patrick','patricia') THEN ARRAY['pat','patrick','patricia']
    WHEN _t IN ('ron','ronald') THEN ARRAY['ron','ronald']
    WHEN _t IN ('ken','kenny','kenneth') THEN ARRAY['ken','kenny','kenneth']
    ELSE ARRAY[_t] END
$$;

CREATE OR REPLACE FUNCTION public.staff_name_matches(_name text, _hay text, _loose boolean)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE _tokens text[]; _t text; _i int; _n int := 0; _hit boolean;
BEGIN
  IF coalesce(_hay,'') = '' THEN RETURN false; END IF;
  SELECT array_agg(x) INTO _tokens FROM (
    SELECT regexp_replace(w, '[^a-z0-9]', '', 'g') x FROM regexp_split_to_table(lower(_name), '\s+') w
  ) s WHERE length(x) >= 3;
  IF _tokens IS NULL THEN RETURN false; END IF;
  FOR _i IN 1..array_length(_tokens,1) LOOP
    _t := _tokens[_i]; _n := _n + 1;
    IF _loose AND _i = 1 THEN
      SELECT bool_or(position(a IN _hay) > 0) INTO _hit FROM unnest(public.staff_name_aliases(_t)) a;
    ELSE
      _hit := position(_t IN _hay) > 0;
    END IF;
    IF NOT _hit THEN RETURN false; END IF;
  END LOOP;
  RETURN _n > 0;
END $$;

CREATE OR REPLACE FUNCTION public.confirm_my_staff_assignment(_assignment_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _name text; _quote uuid; _email text; _full text; _hay1 text; _hay2 text; _matches int;
BEGIN
  IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT staff_name, quote_request_id INTO _name, _quote FROM public.staff_assignments WHERE id = _assignment_id;
  IF _name IS NULL THEN RAISE EXCEPTION 'Shift not found'; END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    SELECT email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
      INTO _email, _full FROM auth.users WHERE id = auth.uid();
    _hay1 := regexp_replace(lower(coalesce(_full, '')), '[^a-z0-9]', '', 'g');
    _hay2 := regexp_replace(lower(split_part(coalesce(_email, ''), '@', 1)), '[^a-z0-9]', '', 'g');
    IF NOT (public.staff_name_matches(_name, _hay1, false) OR public.staff_name_matches(_name, _hay2, false)) THEN
      -- Loose (nickname / first-name) match only if it is the single loose match on this event
      IF NOT (public.staff_name_matches(_name, _hay1, true) OR public.staff_name_matches(_name, _hay2, true)) THEN
        RAISE EXCEPTION 'This shift is not assigned to you';
      END IF;
      SELECT count(*) INTO _matches FROM public.staff_assignments sa
        WHERE sa.quote_request_id = _quote
          AND (public.staff_name_matches(sa.staff_name, _hay1, true) OR public.staff_name_matches(sa.staff_name, _hay2, true));
      IF _matches <> 1 THEN RAISE EXCEPTION 'This shift is not assigned to you'; END IF;
    END IF;
  END IF;

  UPDATE public.staff_assignments SET confirmed = true, updated_at = now() WHERE id = _assignment_id;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.confirm_my_staff_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_my_staff_assignment(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_staff_directory()
RETURNS TABLE(email text, full_name text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY SELECT u.email::text, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::text
    FROM auth.users u WHERE EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role IN ('staff','admin'));
END $$;
REVOKE ALL ON FUNCTION public.get_staff_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_staff_directory() TO authenticated;