-- Fix RLS policies using SECURITY DEFINER functions
-- This approach bypasses RLS by using functions that run with elevated privileges
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies
DROP POLICY IF EXISTS "Workspace members can view source documents for their customers" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can insert source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can update source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can delete source documents in their workspaces" ON source_documents;
DROP POLICY IF EXISTS "Workspace members can manage source documents in their workspaces" ON source_documents;

DROP POLICY IF EXISTS "Workspace members can view reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can insert reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can update reports for their customers" ON reports;
DROP POLICY IF EXISTS "Workspace members can delete reports for their customers" ON reports;
DROP POLICY IF EXISTS "Customers can view their published reports" ON reports;

DROP POLICY IF EXISTS "Workspace members can view report source documents for their reports" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can insert report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can update report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can delete report source documents" ON report_source_documents;
DROP POLICY IF EXISTS "Workspace members can manage report source documents" ON report_source_documents;

-- Create helper function to check if user can access workspace
CREATE OR REPLACE FUNCTION public.can_access_workspace(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = workspace_uuid
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user can access customer
CREATE OR REPLACE FUNCTION public.can_access_customer(customer_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = customer_uuid
    AND (
      EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = c.workspace_id
        AND wm.user_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM workspaces w
        WHERE w.id = c.workspace_id
        AND w.owner_id = auth.uid()
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Source documents policies using the helper function
CREATE POLICY "Workspace members can view source documents"
  ON source_documents FOR SELECT
  USING (public.can_access_workspace(workspace_id));

CREATE POLICY "Workspace members can insert source documents"
  ON source_documents FOR INSERT
  WITH CHECK (
    public.can_access_workspace(workspace_id) AND
    public.can_access_customer(customer_id)
  );

CREATE POLICY "Workspace members can update source documents"
  ON source_documents FOR UPDATE
  USING (public.can_access_workspace(workspace_id))
  WITH CHECK (public.can_access_workspace(workspace_id));

CREATE POLICY "Workspace members can delete source documents"
  ON source_documents FOR DELETE
  USING (public.can_access_workspace(workspace_id));

-- Reports policies using the helper function
CREATE POLICY "Workspace members can view reports"
  ON reports FOR SELECT
  USING (public.can_access_customer(customer_id));

CREATE POLICY "Workspace members can insert reports"
  ON reports FOR INSERT
  WITH CHECK (public.can_access_customer(customer_id));

CREATE POLICY "Workspace members can update reports"
  ON reports FOR UPDATE
  USING (public.can_access_customer(customer_id))
  WITH CHECK (public.can_access_customer(customer_id));

CREATE POLICY "Workspace members can delete reports"
  ON reports FOR DELETE
  USING (public.can_access_customer(customer_id));

CREATE POLICY "Customers can view their published reports"
  ON reports FOR SELECT
  USING (
    status = 'published' AND
    customer_id IN (
      SELECT customer_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Report source documents policies
CREATE POLICY "Workspace members can view report source documents"
  ON report_source_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_source_documents.report_id
      AND public.can_access_customer(r.customer_id)
    )
  );

CREATE POLICY "Workspace members can insert report source documents"
  ON report_source_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_source_documents.report_id
      AND public.can_access_customer(r.customer_id)
    ) AND
    EXISTS (
      SELECT 1 FROM source_documents sd
      WHERE sd.id = report_source_documents.source_document_id
      AND public.can_access_workspace(sd.workspace_id)
    )
  );

CREATE POLICY "Workspace members can update report source documents"
  ON report_source_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_source_documents.report_id
      AND public.can_access_customer(r.customer_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_source_documents.report_id
      AND public.can_access_customer(r.customer_id)
    )
  );

CREATE POLICY "Workspace members can delete report source documents"
  ON report_source_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_source_documents.report_id
      AND public.can_access_customer(r.customer_id)
    )
  );


