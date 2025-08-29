-- Add pricing rules for missing menu categories
INSERT INTO public.pricing_rules (category, item_name, base_price, price_per_person, service_type, is_active) VALUES
-- Appetizers
('appetizer', 'Deviled Eggs', 300, 0, null, true),
('appetizer', 'Pimento Cheese Dip', 400, 0, null, true),
('appetizer', 'Southern Chicken Salad', 450, 0, null, true),
('appetizer', 'Fried Green Tomatoes', 500, 0, null, true),
('appetizer', 'Mini Biscuits with Ham', 600, 0, null, true),

-- Sides
('side', 'Mac and Cheese', 0, 300, null, true),
('side', 'Green Beans', 0, 250, null, true),
('side', 'Collard Greens', 0, 275, null, true),
('side', 'Cornbread', 0, 200, null, true),
('side', 'Coleslaw', 0, 225, null, true),
('side', 'Potato Salad', 0, 250, null, true),
('side', 'Baked Beans', 0, 275, null, true),

-- Desserts
('dessert', 'Peach Cobbler', 0, 400, null, true),
('dessert', 'Banana Pudding', 0, 350, null, true),
('dessert', 'Pecan Pie', 0, 450, null, true),
('dessert', 'Sweet Potato Pie', 0, 400, null, true),

-- Drinks
('drink', 'Sweet Tea', 0, 150, null, true),
('drink', 'Lemonade', 0, 175, null, true),
('drink', 'Coffee Service', 300, 100, null, true),
('drink', 'Soft Drinks', 0, 200, null, true),

-- Equipment and Services
('equipment', 'Chafing Dishes', 2500, 0, null, true),
('equipment', 'Tables (Round)', 1500, 0, null, true),
('equipment', 'Chairs', 500, 0, null, true),
('equipment', 'Linens', 1000, 0, null, true),
('service', 'Wait Staff', 0, 2500, null, true),
('service', 'Setup Service', 15000, 0, null, true),
('service', 'Cleanup Service', 10000, 0, null, true),

-- Dietary restriction upcharges
('dietary', 'Gluten-Free Option', 0, 300, null, true),
('dietary', 'Vegetarian Option', 0, 200, null, true),
('dietary', 'Vegan Option', 0, 400, null, true),
('dietary', 'Dairy-Free Option', 0, 250, null, true);

-- Add fields to invoices table for draft management and overrides
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS draft_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS manual_overrides jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT true;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS last_quote_sync timestamp with time zone;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS override_reason text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reviewed_by text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;