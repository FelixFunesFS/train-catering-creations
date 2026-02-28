INSERT INTO public.user_roles (user_id, role)
VALUES ('97f844e6-92dd-4302-8fdf-67fd7df39f9b', 'staff')
ON CONFLICT (user_id, role) DO NOTHING;