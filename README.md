# Redo

Financial reporting and analysis platform for small businesses.

## Setup

1. **Ensure Node.js version >= 20.9.0:**
   ```bash
   # If using nvm (recommended)
   nvm use
   # This will use the version specified in .nvmrc (LTS)
   
   # Or install manually from nodejs.org
   ```
   
   The project includes a `.nvmrc` file for automatic version switching with nvm.

2. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
   - Create storage buckets:
     - `branding` (public)
     - `source-documents` (private)

3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

- `app/` - Next.js App Router pages
  - `(marketing)/` - Public landing page
  - `(admin)/` - Administrator area
  - `(customer)/` - Customer/client area
- `components/` - React components
  - `ui/` - Shared UI primitives
  - `layout/` - Layout components
  - `revisor/` - Revisor-specific components
  - `customer/` - Customer-specific components
  - `auth/` - Authentication components
- `lib/` - Utility functions
  - `supabase.ts` - Supabase client helpers
  - `auth/` - Authentication helpers
  - `reports/` - Report generation logic

## Features

### Administrator Side
- Create and manage workspaces
- Brand workspace (logo, colors)
- Manage customers
- Upload supporting documents (General Ledger, etc.)
- Generate financial reports
- Publish reports and invite customers

### Customer Side
- View published reports
- Run financial simulations
- What-if scenario analysis

## Database Schema

See `supabase-schema.sql` for the complete database schema including:
- Profiles
- Workspaces
- Workspace members
- Customers
- Reports
- Source documents
- Report source documents (join table)
- Invitations

## Development Notes

- Report generation is currently stubbed with dummy data
- Document parsing will be implemented later
- Email sending for invitations is placeholder (shows link in dev)
- Customer-user linking needs refinement based on your invitation flow
