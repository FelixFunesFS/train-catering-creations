-- Grant admin role to envision@mkqconsulting.com
-- User ID: 8dd8d6be-2d29-4195-8be6-a8d803dfc127

INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  '8dd8d6be-2d29-4195-8be6-a8d803dfc127'::uuid,
  'admin'::user_role,
  '8dd8d6be-2d29-4195-8be6-a8d803dfc127'::uuid
)
ON CONFLICT (user_id, role) DO NOTHING;