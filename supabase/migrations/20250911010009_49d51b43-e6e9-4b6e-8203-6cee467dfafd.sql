-- Simple data cleanup - Part 2: Fix zero pricing
UPDATE invoice_line_items 
SET unit_price = 1600,
    total_price = 1600 * quantity
WHERE unit_price = 0 AND title ILIKE '%meal bundle%';

UPDATE invoice_line_items 
SET unit_price = 450,
    total_price = 450 * quantity  
WHERE unit_price = 0 AND title ILIKE '%appetizer%';

UPDATE invoice_line_items 
SET unit_price = 350,
    total_price = 350 * quantity
WHERE unit_price = 0 AND title ILIKE '%dessert%';

UPDATE invoice_line_items 
SET unit_price = 200,
    total_price = 200 * quantity
WHERE unit_price = 0 AND title ILIKE '%service%';