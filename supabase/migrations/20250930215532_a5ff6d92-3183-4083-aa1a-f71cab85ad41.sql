-- Clean slate migration: Clear change request history
-- This removes all existing change requests to support the new structured menu change system

-- Delete all existing change requests
DELETE FROM change_requests;

-- Add comment for documentation
COMMENT ON TABLE change_requests IS 'Change requests table - migrated to structured menu changes format on 2025-01-31';
