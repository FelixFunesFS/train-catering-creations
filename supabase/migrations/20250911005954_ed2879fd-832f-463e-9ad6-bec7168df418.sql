-- Simple data cleanup - Part 1: Fix document types
UPDATE invoices 
SET document_type = 'estimate'
WHERE is_draft = true 
AND document_type = 'invoice';