-- Add sort_order column to invoice_line_items
ALTER TABLE invoice_line_items 
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Backfill existing items with sequential order based on category + created_at
WITH ordered_items AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY invoice_id 
           ORDER BY 
             CASE category
               WHEN 'Catering Package' THEN 1
               WHEN 'Food' THEN 2
               WHEN 'Appetizers' THEN 3
               WHEN 'Sides' THEN 4
               WHEN 'Desserts' THEN 5
               WHEN 'Beverages' THEN 6
               WHEN 'Service' THEN 7
               WHEN 'Equipment' THEN 8
               ELSE 9
             END,
             created_at ASC
         ) * 10 as new_order
  FROM invoice_line_items
)
UPDATE invoice_line_items 
SET sort_order = ordered_items.new_order
FROM ordered_items 
WHERE invoice_line_items.id = ordered_items.id;