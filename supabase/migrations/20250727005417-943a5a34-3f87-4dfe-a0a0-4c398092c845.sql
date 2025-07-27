-- Update event_type enum to use underscore format instead of hyphens
-- Create new enum with all values
CREATE TYPE event_type_new AS ENUM (
    'corporate',
    'private_party',
    'birthday',
    'baby_shower',
    'bereavement',
    'graduation',
    'retirement',
    'holiday_party',
    'anniversary',
    'other'
);

-- Update the table to use the new enum
ALTER TABLE quote_requests 
ALTER COLUMN event_type TYPE event_type_new 
USING (
    CASE event_type::text
        WHEN 'private-party' THEN 'private_party'::event_type_new
        WHEN 'holiday-party' THEN 'holiday_party'::event_type_new
        ELSE event_type::text::event_type_new
    END
);

-- Drop the old enum and rename the new one
DROP TYPE event_type;
ALTER TYPE event_type_new RENAME TO event_type;