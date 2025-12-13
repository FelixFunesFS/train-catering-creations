-- Drop the old UUID version of the function to resolve overloading conflict
DROP FUNCTION IF EXISTS public.get_estimate_with_line_items(uuid);

-- The text version already exists from the previous migration and is correct