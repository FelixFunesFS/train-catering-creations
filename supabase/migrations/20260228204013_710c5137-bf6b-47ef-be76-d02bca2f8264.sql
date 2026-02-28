
-- Assign staff role to Margery's active account
INSERT INTO public.user_roles (user_id, role)
VALUES ('5ad326c7-6636-4d4e-8337-fcae7b18228c', 'staff')
ON CONFLICT (user_id, role) DO NOTHING;

-- Clean up stale role from old/deleted user ID
DELETE FROM public.user_roles
WHERE user_id = '97f844e6-92dd-4302-8fdf-67fd7df39f9b';
