-- Create pricing rules table with comprehensive pricing structure
INSERT INTO pricing_rules (category, item_name, base_price, price_per_person, service_type, is_active) VALUES
-- Base meal pricing
('meal', 'Standard Entree Package', 0, 1800, 'full-service', true),
('meal', 'Standard Entree Package', 0, 1600, 'delivery-setup', true), 
('meal', 'Standard Entree Package', 0, 1400, 'drop-off', true),

-- Appetizer pricing
('appetizer', 'Appetizer Selection', 0, 350, null, true),

-- Dessert pricing  
('dessert', 'Dessert Selection', 0, 450, null, true),

-- Service charges
('service', 'Full Service', 15000, 200, 'full-service', true),
('service', 'Delivery & Setup', 7500, 100, 'delivery-setup', true),
('service', 'Drop Off Service', 2500, 0, 'drop-off', true),

-- Add-on services
('bussing', 'Table Bussing Service', 10000, 0, null, true),
('wait_staff', 'Wait Staff Service', 0, 300, null, true),
('linens', 'Linen Service', 500, 0, null, true),
('chafers', 'Chafer Rental', 2500, 0, null, true);

-- Create business configuration table for system settings
CREATE TABLE IF NOT EXISTS business_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on business_config
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to business config
CREATE POLICY "Admin can manage business config"
ON business_config
FOR ALL
USING (true);

-- Insert default business configuration
INSERT INTO business_config (config_key, config_value) VALUES
('tax_rate', '{"rate": 0.08, "description": "South Carolina Sales Tax"}'),
('minimum_order', '{"amount": 50000, "description": "Minimum order $500"}'),
('lead_time', '{"days": 3, "description": "Minimum 3 days notice required"}'),
('deposit_percentage', '{"rate": 0.25, "description": "25% deposit required"}'),
('cancellation_policy', '{"hours": 48, "description": "48 hours cancellation notice"}');

-- Create automated workflows table
CREATE TABLE IF NOT EXISTS automated_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  trigger_conditions jsonb DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  enabled boolean DEFAULT true,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  last_run_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on automated_workflows
ALTER TABLE automated_workflows ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to automated workflows
CREATE POLICY "Admin can manage automated workflows"
ON automated_workflows
FOR ALL
USING (true);

-- Insert default automation workflows
INSERT INTO automated_workflows (name, description, trigger_event, actions) VALUES
('Welcome Email', 'Send welcome email when quote is submitted', 'quote_submitted', 
 '[{"type": "send_email", "template": "welcome", "delay_minutes": 0}]'),
('Estimate Notification', 'Notify customer when estimate is ready', 'estimate_created',
 '[{"type": "send_email", "template": "estimate_ready", "delay_minutes": 15}]'),
('Payment Reminder', 'Send payment reminder 24 hours after estimate approval', 'estimate_approved',
 '[{"type": "send_email", "template": "payment_reminder", "delay_hours": 24}]'),
('Event Confirmation', 'Send event confirmation after payment received', 'payment_received',
 '[{"type": "send_email", "template": "event_confirmation", "delay_minutes": 30}]');

-- Create trigger for automated workflows updated_at
CREATE TRIGGER update_automated_workflows_updated_at
  BEFORE UPDATE ON automated_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();