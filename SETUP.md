# Database Setup Instructions

## Step 1: Create All Tables

You need to run the complete database schema in your Supabase SQL Editor.

1. **Open Supabase Dashboard**: Go to https://app.supabase.com
2. **Select your project**
3. **Go to SQL Editor** (left sidebar)
4. **Click "New query"**
5. **Copy and paste the ENTIRE contents of `supabase-schema.sql`**
6. **Click "Run"** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ `profiles` table
- ✅ `workspaces` table  
- ✅ `workspace_members` table
- ✅ `customers` table
- ✅ `reports` table
- ✅ `source_documents` table
- ✅ `report_source_documents` table
- ✅ `invitations` table
- ✅ All RLS policies
- ✅ Database triggers

## Step 2: Create Storage Buckets

After creating the tables, you need to create storage buckets:

1. **Go to Storage** (left sidebar in Supabase)
2. **Create bucket** named `branding`:
   - ⚠️ **IMPORTANT**: Make it **Public** (toggle must be ON)
   - Click "Create bucket"
3. **Create bucket** named `source-documents`:
   - Make it **Private**
   - Click "Create bucket"
4. **Create bucket** named `customer-logos`:
   - ⚠️ **IMPORTANT**: Make it **Public** (toggle must be ON)
   - Click "Create bucket"

**Note**: If buckets are not set to public, you'll get "Bucket not found" errors when trying to view images. You can change this later by going to Storage → [bucket name] → Settings → Toggle "Public bucket".

## Step 2.5: Set Up Storage Policies

After creating the buckets, you need to set up RLS policies for storage:

1. **Go to SQL Editor** in Supabase
2. **Run the contents of `supabase-storage-policies.sql`**
   - This creates policies that allow authenticated users to upload/view files
   - Without these policies, you'll get RLS errors when uploading files

## Step 3: Verify Setup

After running the schema, verify everything is set up:

1. Go to **Table Editor** → You should see all 8 tables
2. Go to **Storage** → You should see 3 buckets (`branding`, `source-documents`, `customer-logos`)
3. Try logging in again

## Troubleshooting

If you get errors:
- Make sure you're running the **entire** `supabase-schema.sql` file
- Check for any existing tables that might conflict
- Look at the error message - it will tell you what's wrong

