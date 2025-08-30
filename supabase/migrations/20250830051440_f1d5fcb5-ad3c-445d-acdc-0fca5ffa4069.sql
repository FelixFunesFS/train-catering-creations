-- Fix security warnings by setting search_path for functions
-- This fixes the "Function Search Path Mutable" warnings

ALTER FUNCTION prevent_duplicate_invoices() SET search_path = 'public';
ALTER FUNCTION update_workflow_status() SET search_path = 'public';