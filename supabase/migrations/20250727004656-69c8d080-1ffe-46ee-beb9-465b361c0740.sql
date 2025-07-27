-- Ensure all event_type enum values are present
-- Add missing values if they don't exist
DO $$
BEGIN
    -- Check and add baby-shower if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::event_type)) AS t(enum_val) WHERE enum_val = 'baby-shower') THEN
        ALTER TYPE event_type ADD VALUE 'baby-shower';
    END IF;
    
    -- Check and add bereavement if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::event_type)) AS t(enum_val) WHERE enum_val = 'bereavement') THEN
        ALTER TYPE event_type ADD VALUE 'bereavement';
    END IF;
    
    -- Check and add retirement if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::event_type)) AS t(enum_val) WHERE enum_val = 'retirement') THEN
        ALTER TYPE event_type ADD VALUE 'retirement';
    END IF;
END $$;