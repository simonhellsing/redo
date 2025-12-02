-- Migration script: Revisor → Administrator, Huvudbok → Source Documents
-- Run this AFTER the main schema if you have existing data

-- 1. Update profiles role from 'revisor' to 'administrator'
UPDATE profiles
SET role = 'administrator'
WHERE role = 'revisor';

-- 2. If huvudbok_uploads table exists, migrate to source_documents
-- First, create source_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS source_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('general_ledger', 'other')) NOT NULL DEFAULT 'general_ledger',
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Migrate data from huvudbok_uploads to source_documents
-- Note: You'll need to get workspace_id from customer_id
INSERT INTO source_documents (
  id,
  workspace_id,
  customer_id,
  type,
  storage_path,
  uploaded_by,
  uploaded_at,
  metadata
)
SELECT 
  h.id,
  c.workspace_id,
  h.customer_id,
  'general_ledger'::TEXT,
  h.storage_path,
  h.uploaded_by,
  h.uploaded_at,
  h.raw_metadata
FROM huvudbok_uploads h
JOIN customers c ON h.customer_id = c.id
ON CONFLICT (id) DO NOTHING;

-- 3. Create report_source_documents join table
CREATE TABLE IF NOT EXISTS report_source_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  relation_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, source_document_id)
);

-- Migrate report relationships from reports.latest_huvudbok_upload_id
INSERT INTO report_source_documents (report_id, source_document_id, created_at)
SELECT 
  r.id,
  r.latest_huvudbok_upload_id,
  r.created_at
FROM reports r
WHERE r.latest_huvudbok_upload_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Remove legacy field from reports (after migration)
-- ALTER TABLE reports DROP COLUMN IF EXISTS latest_huvudbok_upload_id;
-- Note: Commented out - uncomment after verifying migration

-- 5. Drop old huvudbok_uploads table (after verifying migration)
-- DROP TABLE IF EXISTS huvudbok_uploads CASCADE;
-- Note: Commented out - uncomment after verifying migration

