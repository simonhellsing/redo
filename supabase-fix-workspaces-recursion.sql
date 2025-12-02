-- Fix: Resolve infinite recursion in workspaces policies
-- Run this in your Supabase SQL Editor

-- First, create a helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Workspace members can view their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can view their workspaces" ON workspaces;

-- Create two separate policies to avoid recursion
-- Policy 1: Workspace owners (no recursion - direct check)
CREATE POLICY "Workspace owners can view their workspaces"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid());

-- Policy 2: Workspace members (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Workspace members can view their workspaces"
  ON workspaces FOR SELECT
  USING (public.is_workspace_member(id, auth.uid()));

