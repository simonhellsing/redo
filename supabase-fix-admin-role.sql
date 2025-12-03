-- Fix admin role for your user account
-- Run this in your Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual admin email address

-- Option 1: Update by email (if you know your user ID from auth.users)
UPDATE profiles
SET role = 'administrator'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Option 2: Update all profiles that should be administrators
-- (Use this if you want to set all existing users to administrator)
-- UPDATE profiles
-- SET role = 'administrator'
-- WHERE role = 'customer';

-- Option 3: View your current profile to see what needs fixing
-- SELECT p.id, p.name, p.role, u.email
-- FROM profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE u.email = 'your-email@example.com';

