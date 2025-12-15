-- Create staff_assignments table for event staff management
CREATE TABLE public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE NOT NULL,
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lead_chef', 'sous_chef', 'server', 'driver', 'setup_crew', 'bartender')),
  arrival_time TIME,
  notes TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admin full access to staff assignments" 
  ON public.staff_assignments 
  FOR ALL 
  USING (is_admin()) 
  WITH CHECK (is_admin());

-- Create event_shopping_items table for shopping list persistence
CREATE TABLE public.event_shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('proteins', 'produce', 'dairy', 'dry_goods', 'beverages', 'supplies', 'equipment', 'other')),
  quantity TEXT,
  unit TEXT,
  checked BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_shopping_items ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admin full access to shopping items" 
  ON public.event_shopping_items 
  FOR ALL 
  USING (is_admin()) 
  WITH CHECK (is_admin());

-- Add updated_at trigger for staff_assignments
CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON public.staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();