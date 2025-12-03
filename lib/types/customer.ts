// Customer type definitions

export type CustomerStatus = 'Aktiv' | 'Passiv';

export interface Customer {
  id: string;
  workspace_id: string;
  name: string; // Maps to company_name in UI
  company_name?: string; // Alias for name
  logo_url: string | null;
  org_number: string | null; // Maps to orgnr in UI
  orgnr: string | null;
  bolagsform: string | null;
  ansvarig_konsult: string | null;
  kontaktperson: string | null;
  contact_email: string | null; // Maps to epost in UI
  epost: string | null;
  telefon: string | null;
  räkenskapsår_start: string | null; // ISO date string
  räkenskapsår_slut: string | null; // ISO date string
  tjänster: string | null;
  fortnox_id: string | null;
  status: CustomerStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

