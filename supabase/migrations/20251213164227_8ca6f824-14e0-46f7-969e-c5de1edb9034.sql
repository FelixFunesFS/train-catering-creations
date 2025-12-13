-- Backfill items with sort_order = 0 with sequential values based on category
WITH ordered_items AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY invoice_id 
           ORDER BY 
             CASE category
               WHEN 'package' THEN 1
               WHEN 'appetizers' THEN 2
               WHEN 'sides' THEN 3
               WHEN 'desserts' THEN 4
               WHEN 'service' THEN 5
               WHEN 'supplies' THEN 6
               ELSE 7
             END,
             created_at ASC
         ) * 10 as new_order
  FROM invoice_line_items
  WHERE sort_order = 0 OR sort_order IS NULL
)
UPDATE invoice_line_items 
SET sort_order = ordered_items.new_order
FROM ordered_items 
WHERE invoice_line_items.id = ordered_items.id;