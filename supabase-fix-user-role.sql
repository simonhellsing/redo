-- Fix user role: Set user to administrator
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists and see their current profile status
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  p.role as profile_role,
  p.name as profile_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'simonhellsing@gmail.com';

-- Create or update the profile with administrator role
-- This uses upsert to handle both cases (profile exists or doesn't exist)
INSERT INTO profiles (id, name, role)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1), 'User') as name,
  'administrator' as role
FROM auth.users u
WHERE u.email = 'simonhellsing@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'administrator',
  name = COALESCE(EXCLUDED.name, profiles.name),
  updated_at = NOW();

-- Verify the update
SELECT 
  u.id,
  u.email,
  p.role,
  p.name,
  p.created_at,
  p.updated_at
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'simonhellsing@gmail.com';

