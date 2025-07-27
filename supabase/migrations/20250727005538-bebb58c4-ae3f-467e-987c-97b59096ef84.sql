-- Update service_type enum to match form schema
-- Create new enum with all values  
CREATE TYPE service_type_new AS ENUM (
    'full-service',
    'delivery-only', 
    'delivery-setup',
    'drop-off'
);

-- Update the table to use the new enum
ALTER TABLE quote_requests 
ALTER COLUMN service_type TYPE service_type_new 
USING (
    CASE service_type::text
        WHEN 'drop-off' THEN 'delivery-only'::service_type_new
        ELSE service_type::text::service_type_new
    END
);

-- Drop the old enum and rename the new one
DROP TYPE service_type;
ALTER TYPE service_type_new RENAME TO service_type;