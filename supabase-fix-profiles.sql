-- Fix: Add missing INSERT policy for profiles table
-- Run this in your Supabase SQL Editor if you're getting profile creation errors

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

