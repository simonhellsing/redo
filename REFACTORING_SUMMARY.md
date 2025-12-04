# Refactoring Summary: Revisor → Administrator, Huvudbok → Source Documents

## Overview

This document summarizes the comprehensive refactoring performed to make the Redo system more general and future-proof.

## 1. Revisor → Administrator

### Database Changes
- ✅ Updated `profiles.role` constraint: `'revisor'` → `'administrator'`
- ✅ Updated database trigger to create profiles with `'administrator'` role
- ✅ Updated all RLS policies and functions

### Code Changes
- ✅ Renamed `requireRevisor()` → `requireAdministrator()`
- ✅ Updated all imports and references
- ✅ Renamed route group `(revisor)` → `(admin)`
- ✅ Renamed component directory `components/revisor` → `components/admin`
- ✅ Renamed `RevisorLayout` → `AdminLayout`
- ✅ Updated all UI text from "Revisor" to "Administrator"

### Files Changed
- `lib/auth/requireRevisor.ts` → `lib/auth/requireAdministrator.ts`
- `app/(revisor)/` → `app/(admin)/`
- `components/revisor/` → `components/admin/`
- `components/layout/RevisorLayout.tsx` → `components/layout/AdminLayout.tsx`
- All API routes updated
- All page components updated

## 2. Huvudbok → Source Documents

### Database Schema Changes

#### New Tables
- ✅ `source_documents` (replaces `huvudbok_uploads`)
  - `id`, `workspace_id`, `customer_id`
  - `type` (enum: 'general_ledger', 'other')
  - `storage_path`, `uploaded_by`, `uploaded_at`
  - `metadata` (JSONB)

- ✅ `report_source_documents` (new join table)
  - `id`, `report_id`, `source_document_id`
  - `relation_type`, `created_at`

#### Updated Tables
- ✅ `reports` table
  - Removed `latest_huvudbok_upload_id` field
  - All document relationships now via `report_source_documents`

#### Storage Buckets
- ✅ Updated bucket name: `huvudbok` → `source-documents`

### Code Changes

#### API Routes
- ✅ Created `/api/source-documents/upload` (replaces `/api/huvudbok/upload`)
- ✅ Updated to handle multiple source documents per report
- ✅ Updated to support document type selection

#### Report Generation
- ✅ Renamed `generateReportFromHuvudbok()` → `generateReportFromSourceDocuments()`
- ✅ Updated to accept array of `source_document_id`s
- ✅ Maintains backward compatibility with legacy function

#### Components
- ✅ Created `SourceDocumentUploadForm` (replaces `HuvudbokUploadForm`)
  - Added document type selector
  - Updated to use new API endpoint
- ✅ Created `SupportingDocumentsList` component
  - Shows all supporting documents for a customer
  - Displays document type and metadata
- ✅ Updated `ReportList` component
  - Updated text from "huvudbok" to "supporting document"

#### Pages
- ✅ Updated customer detail page
  - Added "Supporting Documents" section
  - Updated upload form
  - Shows both supporting documents and reports
- ✅ Updated report detail pages
  - Shows linked source documents
  - Displays document metadata

### UI Text Updates
- ✅ "Huvudbok" → "Supporting Document" (user-facing)
- ✅ "General Ledger" used for specific document type
- ✅ Updated all form labels and placeholders
- ✅ Updated error messages and help text

## 3. Migration Plan

### For Existing Data

If you have existing data, you will need a migration that performs the following steps
(see `DB_MIGRATIONS.md` for context):

1. **Update profiles roles**:
   ```sql
   UPDATE profiles SET role = 'administrator' WHERE role = 'revisor';
   ```

2. **Migrate huvudbok_uploads → source_documents**:
   - Creates `source_documents` table
   - Migrates all data with `type = 'general_ledger'`
   - Preserves all relationships

3. **Migrate report relationships**:
   - Creates `report_source_documents` join table
   - Migrates from `reports.latest_huvudbok_upload_id`

4. **Cleanup** (after verification):
   - Drop `latest_huvudbok_upload_id` column
   - Drop `huvudbok_uploads` table

### Storage Migration

1. **Rename storage bucket**:
   - In Supabase Storage, rename `huvudbok` → `source-documents`
   - Or create new bucket and migrate files

2. **Update file paths**:
   - Update `storage_path` in `source_documents` table
   - Or keep old paths if bucket renamed

## 4. Breaking Changes

### API Endpoints
- ❌ `/api/huvudbok/upload` → ✅ `/api/source-documents/upload`
- New required parameter: `workspace_id`
- New optional parameter: `document_type`

### Database
- ❌ `huvudbok_uploads` table → ✅ `source_documents` table
- ❌ `reports.latest_huvudbok_upload_id` → ✅ `report_source_documents` join table

### Functions
- ❌ `requireRevisor()` → ✅ `requireAdministrator()`
- ❌ `generateReportFromHuvudbok()` → ✅ `generateReportFromSourceDocuments()`

## 5. New Features

### Supporting Documents Management
- ✅ Upload multiple document types
- ✅ View all supporting documents per customer
- ✅ Link multiple documents to a single report
- ✅ Document type classification

### Improved Report Generation
- ✅ Support for multiple source documents
- ✅ Better metadata tracking
- ✅ More flexible document relationships

## 6. Files Created

- `components/admin/SourceDocumentUploadForm.tsx` - New upload form
- `components/admin/SupportingDocumentsList.tsx` - Document list component
- `app/api/source-documents/upload/route.ts` - New upload API

## 7. Files Removed

- `lib/auth/requireRevisor.ts` (replaced by `requireAdministrator.ts`)
- `components/revisor/HuvudbokUploadForm.tsx` (replaced by `SourceDocumentUploadForm.tsx`)
- `app/api/huvudbok/upload/route.ts` (replaced by new endpoint)
- `components/layout/RevisorLayout.tsx` (replaced by `AdminLayout.tsx`)

## 8. Testing Checklist

- [ ] Run new database schema
- [ ] Create storage bucket `source-documents`
- [ ] Test administrator login
- [ ] Test customer creation
- [ ] Test supporting document upload
- [ ] Test report generation
- [ ] Test report publishing
- [ ] Test customer invitation flow
- [ ] Verify all UI text updated
- [ ] Check all routes work correctly

## 9. Next Steps

1. **Ensure database schema is up to date**: Verify your schema matches `DB_MIGRATIONS.md`
2. **Create storage bucket**: Create `source-documents` bucket
3. **Test thoroughly**: Verify all functionality works
4. **Migrate existing data**: If applicable, create and run a migration that performs the
   steps described above
5. **Update documentation**: Update any external docs

## Notes

- All changes maintain backward compatibility where possible
- Legacy function `generateReportFromHuvudbok()` kept for reference
- Migration script provided for existing data
- Build passes successfully after refactoring

