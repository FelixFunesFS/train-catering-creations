-- Phase 1: Add metadata column to invoice_line_items for change tracking

-- Add metadata JSONB column
ALTER TABLE invoice_line_items 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add GIN index for efficient metadata queries
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_metadata 
ON invoice_line_items USING GIN (metadata);

-- Backfill existing records with empty metadata
UPDATE invoice_line_items 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN invoice_line_items.metadata IS 'Tracks change metadata: isNew, isModified, quantityChanged, previousQuantity, previousPrice, source, sourceField';