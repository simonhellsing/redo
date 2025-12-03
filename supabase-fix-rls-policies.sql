-- Fix RLS policies for reports and source_documents INSERT operations
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies for source_documents
DROP POLICY IF EXISTS "Workspace members can view source documents for their customers" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can manage source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can insert source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can update source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can delete source documents in their workspaces" ON source_documents;

-- Drop ALL existing policies for reports
DROP POLICY IF EXISTS "Workspace members can view reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can insert reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can update reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can delete reports for their customers" ON reports;
DROP POLICY IF EXISTS "Customers can view their published reports" ON reports;

-- Recreate source_documents policies with proper WITH CHECK clauses
CREATE POLICY "Workspace members can view source documents for their customers"
  ON source_documents FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can insert source documents in their workspaces"
  ON source_documents FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update source documents in their workspaces"
  ON source_documents FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete source documents in their workspaces"
  ON source_documents FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    ) OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Add INSERT, UPDATE, DELETE policies for reports
CREATE POLICY "Workspace members can view reports for their customers"
  ON reports FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can insert reports for their customers"
  ON reports FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can update reports for their customers"
  ON reports FOR UPDATE
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can delete reports for their customers"
  ON reports FOR DELETE
  USING (
    customer_id IN (
      SELECT id FROM customers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- Keep the customer view policy for published reports
CREATE POLICY "Customers can view their published reports"
  ON reports FOR SELECT
  USING (
    status = 'published' AND
    customer_id IN (
      SELECT customer_id FROM profiles
      WHERE id = auth.uid()
      -- Note: We'll need to link customers to users via a customer_users table
      -- For MVP, we'll handle this in application logic
    )
  );

-- Fix report_source_documents policies
-- Drop existing policies
DROP POLICY IF EXISTS "Workspace members can view report source documents for their reports" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can manage report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can insert report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can update report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can delete report source documents" ON report_source_documents;

-- Create explicit policies for report_source_documents
CREATE POLICY "Workspace members can view report source documents for their reports"
  ON report_source_documents FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        ) OR workspace_id IN (
          SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace members can insert report source documents"
  ON report_source_documents FOR INSERT
  WITH CHECK (
    report_id IN (
      SELECT id FROM reports
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        ) OR workspace_id IN (
          SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
      )
    ) AND
    source_document_id IN (
      SELECT id FROM source_documents
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      ) OR workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Workspace members can update report source documents"
  ON report_source_documents FOR UPDATE
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        ) OR workspace_id IN (
          SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    report_id IN (
      SELECT id FROM reports
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        ) OR workspace_id IN (
          SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Workspace members can delete report source documents"
  ON report_source_documents FOR DELETE
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE customer_id IN (
        SELECT id FROM customers
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        ) OR workspace_id IN (
          SELECT id FROM workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  );

