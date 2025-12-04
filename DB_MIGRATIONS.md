## Database Setup and Migrations

This document replaces the standalone `.sql` helper files that previously lived in the repo
(`supabase-schema.sql`, `supabase-storage-policies.sql`, `supabase-migration.sql`, etc.).
Use it as a **conceptual guide** for how your Supabase project should be structured and
what past migrations have done. It is intentionally high‑level so you can re‑create or
inspect the equivalent SQL inside Supabase using your own migration history.

---

## 1. Initial Schema (previously `supabase-schema.sql`)

The app expects the following core tables and concepts in your Supabase Postgres project:

- **profiles**
  - Stores authenticated users
  - Includes a `role` column (e.g. `'administrator'`, `'customer_user'`)
  - Linked to Supabase auth users via `id` (UUID)

- **workspaces**
  - Logical tenant/workspace for an accounting firm
  - Related to `profiles` via a workspace membership table

- **workspace_members**
  - Many‑to‑many between `profiles` and `workspaces`
  - Typically contains `workspace_id`, `user_id`, `role`, `created_at`

- **customers**
  - End‑customers that belong to a workspace
  - At minimum: `id`, `workspace_id`, `name`, contact info, and bookkeeping metadata

- **customer_users**
  - Customer‑side users that can log in to view reports
  - Links a Supabase auth user to a `customer` and a `workspace`

- **reports**
  - Generated financial reports for a given `customer` and `workspace`
  - Linked to one or more source documents (see below)

- **source_documents**
  - Uploaded supporting documents (e.g. general ledger files)
  - Includes file metadata and a storage path into Supabase Storage

- **report_source_documents**
  - Join table between `reports` and `source_documents`

- **invitations**
  - Tracks invitations sent to administrators / customer users

There should also be:

- **RLS policies** enforcing:
  - Administrators can only access data for their workspaces
  - Customer users can only access their own customer + published reports
- **Helper functions**, such as a function to return workspace IDs for a user
  (often named similar to `get_user_workspace_ids()`).

For a fresh project, you can either:

- Re‑create these tables manually via the Supabase Table Editor, or  
- Derive the exact SQL from your existing Supabase project by exporting its schema.

---

## 2. Storage Buckets and Policies (previously `supabase-storage-policies.sql`)

Expected buckets in Supabase Storage:

- **`branding`** (public) – workspace branding assets (logos, etc.)
- **`source-documents`** (private) – uploaded source documents / general ledger files
- **`customer-logos`** (public) – customer‑specific logos

RLS / storage policies should:

- Allow authenticated users to **upload** and **read** the files they are supposed to see
- Restrict access to private buckets (`source-documents`) based on workspace / customer
- Allow public access to public buckets (`branding`, `customer-logos`)

You can manage these policies entirely through the Supabase Dashboard; there is no
requirement to keep the raw SQL in this repo.

---

## 3. Customer Extra Fields (previously `supabase-add-customer-fields.sql`)

The app assumes the `customers` table contains additional bookkeeping and contact fields
used by the CSV import / bulk‑create flows. The historical migration added roughly:

- `orgnr` `TEXT`
- `bolagsform` `TEXT`
- `ansvarig_konsult` `TEXT`
- `kontaktperson` `TEXT`
- `epost` `TEXT`
- `telefon` `TEXT`
- `räkenskapsår_start` `DATE`
- `räkenskapsår_slut` `DATE`
- `tjänster` `TEXT`
- `fortnox_id` `TEXT`
- `status` `TEXT` with a constraint like `CHECK (status IN ('Aktiv', 'Passiv'))`

And it mapped legacy columns where present:

- `org_number` → `orgnr`
- `contact_email` → `epost`

If you see errors about missing customer columns when inserting, ensure your `customers`
table has these fields.

---

## 4. Workspace ID Migration (see `SCHEMA_MIGRATION_GUIDE.md`)

The **workspace ID** migration (originally in `supabase-improved-schema-migration.sql`)
made workspace relationships explicit by:

- Adding `workspace_id` to `customer_users`
- Adding `workspace_id` to `reports`
- Backfilling those columns based on each row’s related `customers.workspace_id`
- Updating RLS policies to key off the explicit `workspace_id`
- Adding indexes and validation triggers

See `SCHEMA_MIGRATION_GUIDE.md` for more detail and for verification SQL you can run.

For a new project, simply ensure:

- Every `customer_users` row has a valid `workspace_id` matching its customer
- Every `reports` row has a valid `workspace_id` matching its customer

---

## 5. Revisor → Administrator, Huvudbok → Source Documents

The refactor summarized in `REFACTORING_SUMMARY.md` was previously implemented via
`supabase-migration.sql`. Conceptually, it:

- Updated `profiles.role` values from `'revisor'` to `'administrator'`
- Replaced an old `huvudbok_uploads` table with `source_documents`
- Introduced `report_source_documents` as a join table
- Removed `reports.latest_huvudbok_upload_id` in favor of the join table
- Updated any RLS policies / triggers that referenced the old structures

If you are starting from a clean database, implement the **final** structure described in
`REFACTORING_SUMMARY.md` directly; you do not need the intermediate migration script.

---

## 6. Role and RLS Fixes (previous `supabase-fix-*.sql` scripts)

A handful of one‑off scripts with names like:

- `supabase-fix-user-role.sql`
- `supabase-fix-admin-role.sql`
- `supabase-fix-profiles.sql`
- `supabase-fix-rls-policies.sql`
- `supabase-fix-rls-policies-v2.sql`
- `supabase-fix-workspace-*.sql`
- `supabase-fix-customer-logos-storage.sql`

were used to patch early data and policy issues in production instances.

For new setups you generally **do not need** these scripts as long as:

- `profiles.role` is constrained to valid values used in the app
- RLS policies enforce per‑workspace access for administrators
- RLS policies restrict customer users to their own published reports
- Storage policies correctly protect private buckets and expose public buckets

For existing projects, rely on your Supabase migration history or manual fixes rather than
these removed helper files.

---

## 7. How to Work Without the `.sql` Files

- Use this document, `SCHEMA_MIGRATION_GUIDE.md`, and `REFACTORING_SUMMARY.md` as the
  **single source of truth** about how the database is expected to look.
- For a fresh project:
  - Create the described tables and relationships using Supabase’s UI or migrations
  - Set up RLS and storage policies to match the access rules described here
- For existing projects:
  - Compare your live schema against these expectations
  - Add small, focused migrations inside Supabase to close any gaps


