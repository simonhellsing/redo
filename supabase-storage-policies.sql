-- Storage bucket policies for Redo
-- Run this in your Supabase SQL Editor

-- Policies for 'branding' bucket (public)
-- Allow authenticated users to upload branding files
CREATE POLICY "Authenticated users can upload branding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding');

-- Allow public to view branding files (since bucket is public)
CREATE POLICY "Public can view branding files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'branding');

-- Allow authenticated users to update branding files
CREATE POLICY "Authenticated users can update branding files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'branding')
WITH CHECK (bucket_id = 'branding');

-- Allow authenticated users to delete branding files
CREATE POLICY "Authenticated users can delete branding files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'branding');

-- Policies for 'source-documents' bucket (private)
-- Allow authenticated users to upload source documents
CREATE POLICY "Authenticated users can upload source documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'source-documents');

-- Allow authenticated users to view source documents
CREATE POLICY "Authenticated users can view source documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'source-documents');

-- Allow authenticated users to update source documents
CREATE POLICY "Authenticated users can update source documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'source-documents')
WITH CHECK (bucket_id = 'source-documents');

-- Allow authenticated users to delete source documents
CREATE POLICY "Authenticated users can delete source documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'source-documents');

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

