-- Fix: Ensure workspace UPDATE policy allows workspace owners to update
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;

-- Create UPDATE policy for workspace owners
CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

