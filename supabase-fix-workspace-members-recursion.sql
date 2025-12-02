-- Fix: Resolve infinite recursion in workspace_members policies
-- Run this in your Supabase SQL Editor

-- Drop all existing workspace_members policies to start fresh
DROP POLICY IF EXISTS "Workspace members can view members of their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can view members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view other members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON workspace_members;

-- Create new policies that avoid recursion
-- Policy 1: Workspace owners can see all members (no recursion - checks workspaces table only)
CREATE POLICY "Workspace owners can view members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policy 2: Users can see their own membership records (no recursion - direct user_id check)
CREATE POLICY "Users can view their own membership"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

