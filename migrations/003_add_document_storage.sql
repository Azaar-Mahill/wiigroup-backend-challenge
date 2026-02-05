-- Migration to store documents directly in PostgreSQL instead of file system
-- Add columns for document binary data, original filename, and MIME type

ALTER TABLE providers
ADD COLUMN IF NOT EXISTS document_data BYTEA,
ADD COLUMN IF NOT EXISTS document_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_mime_type VARCHAR(100);

-- Add comment for clarity
COMMENT ON COLUMN providers.document_data IS 'Binary content of the uploaded document';
COMMENT ON COLUMN providers.document_name IS 'Original filename of the uploaded document';
COMMENT ON COLUMN providers.document_mime_type IS 'MIME type of the uploaded document';
