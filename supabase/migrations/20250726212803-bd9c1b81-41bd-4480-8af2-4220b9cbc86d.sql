-- Create enum types for structured data
CREATE TYPE public.event_type AS ENUM (
  'corporate',
  'private-party',
  'birthday',
  'anniversary',
  'graduation',
  'holiday-party',
  'other'
);

CREATE TYPE public.service_type AS ENUM (
  'drop-off',
  'full-service'
);

CREATE TYPE public.quote_status AS ENUM (
  'pending',
  'reviewed',
  'quoted',
  'confirmed',
  'completed',
  'cancelled'
);

-- Create the main quote_requests table
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Information
  contact_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Event Details
  event_type event_type NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count >= 1 AND guest_count <= 1000),
  location TEXT NOT NULL,
  
  -- Service Configuration
  service_type service_type NOT NULL,
  serving_start_time TIME,
  wait_staff_requested BOOLEAN DEFAULT false,
  wait_staff_setup_areas TEXT,
  wait_staff_requirements TEXT,
  
  -- Menu Selections (stored as JSONB for flexibility)
  primary_protein TEXT,
  secondary_protein TEXT,
  appetizers JSONB DEFAULT '[]'::jsonb,
  sides JSONB DEFAULT '[]'::jsonb,
  desserts JSONB DEFAULT '[]'::jsonb,
  drinks JSONB DEFAULT '[]'::jsonb,
  utensils JSONB DEFAULT '[]'::jsonb,
  extras JSONB DEFAULT '[]'::jsonb,
  custom_menu_requests TEXT,
  
  -- Additional Services (boolean flags)
  chafers_requested BOOLEAN DEFAULT false,
  tables_chairs_requested BOOLEAN DEFAULT false,
  linens_requested BOOLEAN DEFAULT false,
  
  -- Dietary and Special Requests
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  special_requests TEXT,
  
  -- Metadata
  referral_source TEXT,
  status quote_status DEFAULT 'pending',
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert quote requests (public form)
CREATE POLICY "Anyone can submit quote requests" 
ON public.quote_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow reading all quote requests (for admin review)
CREATE POLICY "Public read access for quote requests" 
ON public.quote_requests 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create indexes for common queries
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_event_date ON public.quote_requests(event_date);
CREATE INDEX idx_quote_requests_created_at ON public.quote_requests(created_at);
CREATE INDEX idx_quote_requests_email ON public.quote_requests(email);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();