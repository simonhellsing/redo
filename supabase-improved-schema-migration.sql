-- ============================================
-- IMPROVED SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Add workspace_id to customer_users table
ALTER TABLE customer_users 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Populate workspace_id from customers table
UPDATE customer_users cu
SET workspace_id = c.workspace_id
FROM customers c
WHERE cu.customer_id = c.id
AND cu.workspace_id IS NULL;

-- Make workspace_id NOT NULL after populating
ALTER TABLE customer_users 
ALTER COLUMN workspace_id SET NOT NULL;

-- Drop old unique constraint if it exists (user_id, customer_id)
ALTER TABLE customer_users
DROP CONSTRAINT IF EXISTS customer_users_user_id_customer_id_key;

-- Add new unique constraint for (workspace_id, customer_id, user_id)
ALTER TABLE customer_users
ADD CONSTRAINT customer_users_workspace_customer_user_key 
UNIQUE(workspace_id, customer_id, user_id);

-- Step 2: Add workspace_id to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Populate workspace_id from customers table
UPDATE reports r
SET workspace_id = c.workspace_id
FROM customers c
WHERE r.customer_id = c.id
AND r.workspace_id IS NULL;

-- Make workspace_id NOT NULL after populating
ALTER TABLE reports 
ALTER COLUMN workspace_id SET NOT NULL;

-- Step 3: Update workspace_members to support 'administrator' role
ALTER TABLE workspace_members
DROP CONSTRAINT IF EXISTS workspace_members_role_check;

ALTER TABLE workspace_members
ADD CONSTRAINT workspace_members_role_check 
CHECK (role IN ('owner', 'administrator', 'collaborator'));

-- Step 4: Create helper function for getting user workspace IDs
CREATE OR REPLACE FUNCTION get_user_workspace_ids(user_uuid UUID)
RETURNS TABLE(workspace_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id
  FROM workspaces w
  WHERE w.owner_id = user_uuid
  UNION
  SELECT wm.workspace_id
  FROM workspace_members wm
  WHERE wm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_users_workspace_id ON customer_users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON workspace_members(role);

-- Step 6: Drop old RLS policies for customer_users
DROP POLICY IF EXISTS "Customers can view their own customer_user records" ON customer_users;
DROP POLICY IF EXISTS "Workspace members can view customer_users for their customers" ON customer_users;
DROP POLICY IF EXISTS "Workspace members can insert customer_users" ON customer_users;

-- Step 7: Create improved RLS policies for customer_users
CREATE POLICY "Users can view their own customer_user records"
  ON customer_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Workspace administrators can view customer_users in their workspaces"
  ON customer_users FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_user_workspace_ids(auth.uid())
    )
  );

CREATE POLICY "Workspace administrators can manage customer_users in their workspaces"
  ON customer_users FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_user_workspace_ids(auth.uid())
    )
  );

-- Step 8: Update reports policies to use workspace_id
DROP POLICY IF EXISTS "Workspace members can view reports for their customers" ON reports;
DROP POLICY IF EXISTS "Customers can view their published reports" ON reports;

CREATE POLICY "Workspace members can view reports in their workspaces"
  ON reports FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_user_workspace_ids(auth.uid())
    )
  );

CREATE POLICY "Workspace members can manage reports in their workspaces"
  ON reports FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_user_workspace_ids(auth.uid())
    )
  );

CREATE POLICY "Customer users can view their published reports"
  ON reports FOR SELECT
  USING (
    status = 'published' AND
    customer_id IN (
      SELECT customer_id FROM customer_users
      WHERE user_id = auth.uid()
    )
  );

-- Step 9: Add constraint to ensure customer belongs to workspace
-- Note: This is a check constraint that validates the relationship
-- We'll add it as a trigger instead since CHECK constraints can't reference other tables directly

CREATE OR REPLACE FUNCTION validate_customer_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM customers 
    WHERE id = NEW.customer_id 
    AND workspace_id = NEW.workspace_id
  ) THEN
    RAISE EXCEPTION 'Customer does not belong to the specified workspace';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_customer_workspace ON customer_users;
CREATE TRIGGER check_customer_workspace
  BEFORE INSERT OR UPDATE ON customer_users
  FOR EACH ROW
  EXECUTE FUNCTION validate_customer_workspace();

-- Step 10: Add updated_at trigger for customer_users
CREATE TRIGGER update_customer_users_updated_at 
  BEFORE UPDATE ON customer_users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Verify data integrity
DO $$
DECLARE
  orphaned_customer_users INTEGER;
  orphaned_reports INTEGER;
BEGIN
  -- Check for customer_users without valid workspace_id
  SELECT COUNT(*) INTO orphaned_customer_users
  FROM customer_users cu
  WHERE NOT EXISTS (
    SELECT 1 FROM customers c 
    WHERE c.id = cu.customer_id 
    AND c.workspace_id = cu.workspace_id
  );
  
  -- Check for reports without valid workspace_id
  SELECT COUNT(*) INTO orphaned_reports
  FROM reports r
  WHERE NOT EXISTS (
    SELECT 1 FROM customers c 
    WHERE c.id = r.customer_id 
    AND c.workspace_id = r.workspace_id
  );
  
  IF orphaned_customer_users > 0 THEN
    RAISE WARNING 'Found % orphaned customer_users records', orphaned_customer_users;
  END IF;
  
  IF orphaned_reports > 0 THEN
    RAISE WARNING 'Found % orphaned reports records', orphaned_reports;
  END IF;
END;
$$;

