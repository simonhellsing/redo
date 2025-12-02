-- Fix: Add missing INSERT policy for workspaces table
-- Run this in your Supabase SQL Editor if you're getting workspace creation errors

CREATE POLICY "Users can create their own workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

