-- Migration: Add customer_users table to link customer users to customers
-- Run this in your Supabase SQL Editor

-- Customer users table (links customer users to customers)
CREATE TABLE IF NOT EXISTS customer_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, customer_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_users_user_id ON customer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_customer_id ON customer_users(customer_id);

-- RLS Policies for customer_users
ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;

-- Customers can view their own customer_user records
CREATE POLICY "Customers can view their own customer_user records"
  ON customer_users FOR SELECT
  USING (user_id = auth.uid());

-- Workspace members can view customer_users for their customers
CREATE POLICY "Workspace members can view customer_users for their customers"
  ON customer_users FOR SELECT
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

-- Workspace members can insert customer_users
CREATE POLICY "Workspace members can insert customer_users"
  ON customer_users FOR INSERT
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

-- Update reports policy to use customer_users table
DROP POLICY IF EXISTS "Customers can view their published reports" ON reports;

CREATE POLICY "Customers can view their published reports"
  ON reports FOR SELECT
  USING (
    status = 'published' AND
    customer_id IN (
      SELECT customer_id FROM customer_users
      WHERE user_id = auth.uid()
    )
  );

