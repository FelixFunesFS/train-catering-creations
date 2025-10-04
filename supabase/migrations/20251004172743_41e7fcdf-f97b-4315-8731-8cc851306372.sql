-- Create storage bucket for event documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-documents',
  'event-documents',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
);

-- Create event_documents table for tracking metadata
CREATE TABLE public.event_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('contract', 'menu', 'floor_plan', 'license', 'invoice', 'receipt', 'other')),
  version INTEGER NOT NULL DEFAULT 1,
  is_customer_visible BOOLEAN NOT NULL DEFAULT false,
  uploaded_by TEXT NOT NULL DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_documents
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;

-- Admin can manage all documents
CREATE POLICY "Admin can manage event documents"
ON public.event_documents
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Customers can view their visible documents
CREATE POLICY "Customers can view their documents"
ON public.event_documents
FOR SELECT
USING (
  is_customer_visible = true AND
  quote_request_id IN (
    SELECT id FROM quote_requests 
    WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  )
);

-- Storage policies for event-documents bucket
CREATE POLICY "Admin can upload event documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-documents' AND
  is_admin()
);

CREATE POLICY "Admin can view all event documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'event-documents' AND
  is_admin()
);

CREATE POLICY "Admin can update event documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-documents' AND
  is_admin()
);

CREATE POLICY "Admin can delete event documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-documents' AND
  is_admin()
);

-- Customers can view their documents
CREATE POLICY "Customers can view their event documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'event-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM quote_requests 
    WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_event_documents_quote_id ON public.event_documents(quote_request_id);
CREATE INDEX idx_event_documents_category ON public.event_documents(document_category);
CREATE INDEX idx_event_documents_visible ON public.event_documents(is_customer_visible);

-- Trigger to update updated_at
CREATE TRIGGER update_event_documents_updated_at
  BEFORE UPDATE ON public.event_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();