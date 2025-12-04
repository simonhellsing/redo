# Database Setup Instructions

## Step 1: Create All Tables

Create the core tables and relationships described in `DB_MIGRATIONS.md` in your Supabase
project. You can either:

1. **Use Supabase Dashboard**: Go to https://app.supabase.com, open **Table Editor**, and
   create the tables with the names and relationships described there, or
2. **Use your own SQL migrations**: Define migrations that result in the same final
   structure as documented in `DB_MIGRATIONS.md`.

At minimum, you should have:
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

After creating the buckets, you need to set up RLS policies for storage so that:

1. Authenticated users can upload and view files they are allowed to see
2. Public buckets (`branding`, `customer-logos`) are readable publicly
3. Private buckets (`source-documents`) are only readable by authorized users

You can define these policies directly in the Supabase Dashboard using the **Policies**
tab for each bucket, following the expectations described in `DB_MIGRATIONS.md`.

## Step 3: Verify Setup

After running the schema, verify everything is set up:

1. Go to **Table Editor** → You should see all 8 tables
2. Go to **Storage** → You should see 3 buckets (`branding`, `source-documents`, `customer-logos`)
3. Try logging in again

## Troubleshooting

If you get errors:
- Make sure your tables, columns, and relationships match the expectations in
  `DB_MIGRATIONS.md`
- Check for any existing tables that might conflict
- Look at the error message - it will tell you what's wrong

