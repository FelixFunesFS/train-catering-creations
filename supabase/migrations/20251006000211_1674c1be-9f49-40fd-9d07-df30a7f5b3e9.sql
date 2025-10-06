-- Add wedding-specific event types to existing enum
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'wedding';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'black_tie';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'military_function';

-- Add comment for documentation
COMMENT ON TYPE event_type IS 'Event types for catering requests, including regular events and formal/wedding events';