-- Add email tracking and view tracking columns to invoices table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'email_opened_at') THEN
        ALTER TABLE public.invoices ADD COLUMN email_opened_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'email_opened_count') THEN
        ALTER TABLE public.invoices ADD COLUMN email_opened_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'estimate_viewed_at') THEN
        ALTER TABLE public.invoices ADD COLUMN estimate_viewed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'estimate_viewed_count') THEN
        ALTER TABLE public.invoices ADD COLUMN estimate_viewed_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'last_customer_interaction') THEN
        ALTER TABLE public.invoices ADD COLUMN last_customer_interaction TIMESTAMPTZ;
    END IF;
END $$;

-- Create email templates table for customizable email content (only if it doesn't exist)
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

-- Enable RLS on email_templates (if table was just created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_templates' 
        AND policyname = 'Admin can manage email templates'
    ) THEN
        ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admin can manage email templates" ON public.email_templates
          FOR ALL USING (true);
    END IF;
END $$;