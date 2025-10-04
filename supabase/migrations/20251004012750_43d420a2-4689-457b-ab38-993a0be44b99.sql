-- Add RLS policy to allow admin users to read gmail_tokens
CREATE POLICY "Admin users can read gmail tokens"
ON public.gmail_tokens
FOR SELECT
USING (is_admin());

-- Add RLS policy to allow admin users to insert gmail_tokens (for OAuth flow)
CREATE POLICY "Admin users can insert gmail tokens"
ON public.gmail_tokens
FOR INSERT
WITH CHECK (is_admin());

-- Add RLS policy to allow admin users to update gmail_tokens (for token refresh)
CREATE POLICY "Admin users can update gmail tokens"
ON public.gmail_tokens
FOR UPDATE
USING (is_admin());

-- Add RLS policy to allow admin users to delete gmail_tokens
CREATE POLICY "Admin users can delete gmail tokens"
ON public.gmail_tokens
FOR DELETE
USING (is_admin());