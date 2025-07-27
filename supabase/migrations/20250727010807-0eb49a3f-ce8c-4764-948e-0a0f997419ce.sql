-- Add missing columns to quote_requests table for better form field mapping
ALTER TABLE public.quote_requests 
ADD COLUMN both_proteins_available boolean DEFAULT false,
ADD COLUMN guest_count_with_restrictions text,
ADD COLUMN bussing_tables_needed boolean DEFAULT false,
ADD COLUMN separate_serving_area boolean DEFAULT false,
ADD COLUMN serving_setup_area text,
ADD COLUMN serving_utensils_requested boolean DEFAULT false,
ADD COLUMN cups_requested boolean DEFAULT false,
ADD COLUMN plates_requested boolean DEFAULT false,
ADD COLUMN napkins_requested boolean DEFAULT false,
ADD COLUMN ice_requested boolean DEFAULT false;