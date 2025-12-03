import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

interface CustomerInput {
  company_name: string
  orgnr: string | null
  logo_url: string | null
  bolagsform: string | null
  ansvarig_konsult: string | null
  kontaktperson: string | null
  epost: string | null
  telefon: string | null
  räkenskapsår_start: string | null
  räkenskapsår_slut: string | null
  tjänster: string | null
  fortnox_id: string | null
  status: 'Aktiv' | 'Passiv'
}

export async function POST(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const body = await request.json()
    
    const { workspace_id, customers } = body as {
      workspace_id: string
      customers: CustomerInput[]
    }

    if (!workspace_id) {
      return NextResponse.json(
        { error: 'workspace_id är obligatoriskt' },
        { status: 400 }
      )
    }

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'Inga kunder att lägga till' },
        { status: 400 }
      )
    }

    // Prepare customer data for insertion
    const customerData = customers.map((customer) => ({
      workspace_id,
      name: customer.company_name,
      orgnr: customer.orgnr || null,
      org_number: customer.orgnr || null, // Keep for backward compatibility
      bolagsform: customer.bolagsform || null,
      ansvarig_konsult: customer.ansvarig_konsult || null,
      kontaktperson: customer.kontaktperson || null,
      epost: customer.epost || null,
      contact_email: customer.epost || null, // Keep for backward compatibility
      telefon: customer.telefon || null,
      räkenskapsår_start: customer.räkenskapsår_start || null,
      räkenskapsår_slut: customer.räkenskapsår_slut || null,
      tjänster: customer.tjänster || null,
      fortnox_id: customer.fortnox_id || null,
      status: customer.status || 'Aktiv',
      logo_url: customer.logo_url || null,
    }))

    // Insert all customers
    const { data: createdCustomers, error: insertError } = await supabase
      .from('customers')
      .insert(customerData)
      .select()

    if (insertError) {
      console.error('Error creating customers:', insertError)
      
      // Check if the error is about missing columns
      if (insertError.message.includes('schema cache') || insertError.message.includes('column')) {
        return NextResponse.json(
          { 
            error: `Kunde inte lägga till kunder: ${insertError.message}. Kontrollera att databasmigreringen har körts (supabase-add-customer-fields.sql)`,
            migrationRequired: true
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Kunde inte lägga till kunder: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      customers: createdCustomers,
      count: createdCustomers?.length || 0,
    })
  } catch (error: any) {
    console.error('Error in bulk create:', error)
    return NextResponse.json(
      { error: error.message || 'Ett fel uppstod vid tillägg av kunder' },
      { status: 500 }
    )
  }
}

