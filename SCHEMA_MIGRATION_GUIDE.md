# Database Schema Migration Guide

## Overview
This guide describes the **workspace_id** migration applied to the database. The original
SQL file (`supabase-improved-schema-migration.sql`) has been removed from the repo; use
this document to verify that your schema matches what the code expects and to create an
equivalent migration inside Supabase if needed.

The goal is to add explicit `workspace_id` columns to `customer_users` and `reports`
tables, making workspace relationships explicit and improving query performance.

## Migration Steps

### 1. Apply the Workspace ID Migration

Ensure your database has had the workspace ID migration applied. In practical terms, your
schema and data should satisfy the following:
- Add `workspace_id` to `customer_users` table
- Add `workspace_id` to `reports` table
- Populate existing data with workspace IDs
- Create improved indexes
- Update RLS policies
- Add data validation triggers

### 2. Code Changes Applied
The following files have been updated to work with the new schema:

- ✅ `components/auth/AcceptInvitationForm.tsx` - Now includes `workspace_id` when creating `customer_users`
- ✅ `app/api/huvudbok/upload/route.ts` - Now includes `workspace_id` when creating/updating reports
- ✅ `lib/auth/getCustomerUserInfo.ts` - Updated to use `workspace_id` from `customer_users`
- ✅ `app/customer/invite/[token]/page.tsx` - Passes `workspace_id` to invitation form

### 3. Benefits

**Before:**
- `customer_users` had indirect workspace relationship (via customer)
- `reports` had indirect workspace relationship (via customer)
- Complex RLS policies with multiple joins
- Slower queries

**After:**
- Direct `workspace_id` columns for faster queries
- Simpler RLS policies using `get_user_workspace_ids()` helper
- Better data integrity with validation triggers
- Improved indexes for performance

### 4. Verification

After running the migration, verify:

1. **Check for orphaned records:**
```sql
-- Should return 0
SELECT COUNT(*) FROM customer_users cu
WHERE NOT EXISTS (
  SELECT 1 FROM customers c 
  WHERE c.id = cu.customer_id 
  AND c.workspace_id = cu.workspace_id
);

-- Should return 0
SELECT COUNT(*) FROM reports r
WHERE NOT EXISTS (
  SELECT 1 FROM customers c 
  WHERE c.id = r.customer_id 
  AND c.workspace_id = r.workspace_id
);
```

2. **Test RLS policies:**
- Administrators should only see customers/reports from their workspaces
- Customer users should only see their own published reports

### 5. Rollback (if needed)

If you need to rollback in a development or staging environment, you can:

- Drop the `workspace_id` columns from `customer_users` and `reports` (data will be lost)
- Restore your previous RLS policies using Supabase’s migration history or by re‑creating
  the old policies manually

## Notes

- The migration preserves all existing data
- Existing `customer_users` records get `workspace_id` populated from their customer
- Existing `reports` records get `workspace_id` populated from their customer
- The unique constraint on `customer_users` is now `(workspace_id, customer_id, user_id)`
- All new inserts must include `workspace_id`


