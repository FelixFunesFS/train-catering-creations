-- Drop the existing policy first, then recreate
DROP POLICY IF EXISTS "Only admins can access email templates" ON public.email_templates;

-- Create the policy again
CREATE POLICY "Only admins can access email templates" 
ON public.email_templates 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());