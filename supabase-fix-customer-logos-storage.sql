-- Fix: Add storage policies for customer-logos bucket
-- Run this in your Supabase SQL Editor

-- Policies for 'customer-logos' bucket (public)
-- Allow authenticated users to upload customer logos
CREATE POLICY "Authenticated users can upload customer logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-logos');

-- Allow public to view customer logos (since bucket is public)
CREATE POLICY "Public can view customer logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'customer-logos');

-- Allow authenticated users to update customer logos
CREATE POLICY "Authenticated users can update customer logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-logos')
WITH CHECK (bucket_id = 'customer-logos');

-- Allow authenticated users to delete customer logos
CREATE POLICY "Authenticated users can delete customer logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'customer-logos');

