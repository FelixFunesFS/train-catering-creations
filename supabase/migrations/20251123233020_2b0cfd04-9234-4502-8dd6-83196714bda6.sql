-- Add new proteins column as jsonb array
ALTER TABLE quote_requests 
ADD COLUMN proteins jsonb DEFAULT '[]'::jsonb;

-- Migrate existing data (combine primary and secondary into array, max 2)
UPDATE quote_requests qr
SET proteins = (
  SELECT jsonb_agg(protein_value)
  FROM (
    SELECT protein_value
    FROM (
      VALUES (qr.primary_protein), (qr.secondary_protein)
    ) AS t(protein_value)
    WHERE protein_value IS NOT NULL AND protein_value != ''
    LIMIT 2
  ) AS combined
)
WHERE (qr.primary_protein IS NOT NULL AND qr.primary_protein != '') 
   OR (qr.secondary_protein IS NOT NULL AND qr.secondary_protein != '');

-- Ensure empty arrays for quotes with no proteins
UPDATE quote_requests
SET proteins = '[]'::jsonb
WHERE proteins IS NULL;

-- Drop old columns
ALTER TABLE quote_requests
DROP COLUMN primary_protein,
DROP COLUMN secondary_protein;

-- Add helpful comment
COMMENT ON COLUMN quote_requests.proteins IS 'Array of selected protein menu items (max 2 selections allowed)';
