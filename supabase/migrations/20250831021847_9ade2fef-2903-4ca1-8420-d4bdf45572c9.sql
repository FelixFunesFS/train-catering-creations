-- Add email tracking and view tracking columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimate_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimate_viewed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_customer_interaction TIMESTAMPTZ;

-- Create email templates table for customizable email content
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('estimate', 'invoice', 'reminder', 'approval', 'contract')),
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates
CREATE POLICY "Admin can manage email templates" ON public.email_templates
  FOR ALL USING (true);

-- Create trigger for updated_at on email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (template_name, template_type, subject_template, body_template, is_default) VALUES
('Default Estimate Email', 'estimate', 'Your Estimate from Soul Train''s Eatery - {{event_name}}', 
'Dear {{customer_name}},

Thank you for choosing Soul Train''s Eatery for your upcoming event!

We''re excited to cater your "{{event_name}}" and bring authentic Southern flavors to your special occasion. Please review the attached estimate details below.

To proceed with booking your event, please review and approve this estimate using the link provided. We''ll then send you a contract and payment information to secure your event date.

If you have any questions or need to make changes, please don''t hesitate to contact us. We''re here to make your event memorable!

Best regards,
The Soul Train''s Eatery Team
📞 (843) 970-0265
📧 soultrainseatery@gmail.com', true),

('Default Invoice Email', 'invoice', 'Your Invoice from Soul Train''s Eatery - {{event_name}}',
'Dear {{customer_name}},

Thank you for choosing Soul Train''s Eatery for your event!

Your invoice is ready for payment. You can view and pay online using the link provided below.

Event Details:
- Event: {{event_name}}
- Date: {{event_date}}
- Location: {{location}}
- Total: {{total_amount}}

If you have any questions, please don''t hesitate to contact us.

Best regards,
The Soul Train''s Eatery Team
📞 (843) 970-0265
📧 soultrainseatery@gmail.com', true);

-- Create estimate_versions table for tracking changes
CREATE TABLE IF NOT EXISTS public.estimate_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changes_summary TEXT,
  previous_total_amount INTEGER,
  new_total_amount INTEGER,
  changed_by TEXT DEFAULT 'admin',
  change_reason TEXT,
  requires_reapproval BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on estimate_versions
ALTER TABLE public.estimate_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for estimate_versions
CREATE POLICY "Admin can manage estimate versions" ON public.estimate_versions
  FOR ALL USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_estimate_versions_invoice_id ON public.estimate_versions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_email_tracking ON public.invoices(email_opened_at, estimate_viewed_at);

-- Add function to automatically create estimate versions on significant changes
CREATE OR REPLACE FUNCTION public.create_estimate_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if total amount changed and invoice has been sent
  IF (OLD.total_amount IS DISTINCT FROM NEW.total_amount AND OLD.sent_at IS NOT NULL) THEN
    INSERT INTO public.estimate_versions (
      invoice_id,
      version_number,
      changes_summary,
      previous_total_amount,
      new_total_amount,
      change_reason
    ) VALUES (
      NEW.id,
      COALESCE((SELECT MAX(version_number) FROM public.estimate_versions WHERE invoice_id = NEW.id), 0) + 1,
      'Total amount changed from $' || (OLD.total_amount / 100.0) || ' to $' || (NEW.total_amount / 100.0),
      OLD.total_amount,
      NEW.total_amount,
      'Estimate modified after being sent'
    );
    
    -- Update status to revised if it was previously sent/approved
    IF OLD.status IN ('sent', 'viewed', 'approved') THEN
      NEW.status = 'revised';
      NEW.workflow_status = 'revised';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for estimate versioning
DROP TRIGGER IF EXISTS trigger_create_estimate_version ON public.invoices;
CREATE TRIGGER trigger_create_estimate_version
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.create_estimate_version();