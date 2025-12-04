-- Migration: Add new fields to customers table
-- This migration adds the following columns to support CSV import fields:
--   - orgnr: text (note: already exists as org_number, but we'll add orgnr for consistency)
--   - bolagsform: text (e.g. 'AB')
--   - ansvarig_konsult: text (internal responsible accountant)
--   - kontaktperson: text (main person at the client)
--   - epost: text (email)
--   - telefon: text (phone)
--   - räkenskapsår_start: date
--   - räkenskapsår_slut: date
--   - tjänster: text (comma-separated or free text description of services)
--   - fortnox_id: text
--   - status: text (e.g. 'Aktiv', 'Passiv')

-- Note: The existing 'name' column will map to 'company_name' in the UI
-- The existing 'org_number' column will map to 'orgnr' in the UI
-- The existing 'contact_email' column will map to 'epost' in the UI

-- Add new columns
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS orgnr TEXT,
  ADD COLUMN IF NOT EXISTS bolagsform TEXT,
  ADD COLUMN IF NOT EXISTS ansvarig_konsult TEXT,
  ADD COLUMN IF NOT EXISTS kontaktperson TEXT,
  ADD COLUMN IF NOT EXISTS epost TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS räkenskapsår_start DATE,
  ADD COLUMN IF NOT EXISTS räkenskapsår_slut DATE,
  ADD COLUMN IF NOT EXISTS tjänster TEXT,
  ADD COLUMN IF NOT EXISTS fortnox_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Aktiv', 'Passiv')) DEFAULT 'Aktiv';

-- Migrate existing data if needed
-- Map org_number to orgnr if orgnr is null
UPDATE customers SET orgnr = org_number WHERE orgnr IS NULL AND org_number IS NOT NULL;

-- Map contact_email to epost if epost is null
UPDATE customers SET epost = contact_email WHERE epost IS NULL AND contact_email IS NOT NULL;

-- Set default status for existing customers
UPDATE customers SET status = 'Aktiv' WHERE status IS NULL;


