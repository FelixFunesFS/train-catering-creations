REVOKE ALL ON FUNCTION public.serialize_payment_with_pricing() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.serialize_payment_with_pricing() TO service_role;