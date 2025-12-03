import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

interface ParsedCustomer {
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

function parseCSV(csvText: string): ParsedCustomer[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV-filen måste innehålla minst en rubrikrad och en datarad')
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  // Map header names to our field names (case-insensitive, Swedish/English)
  const headerMap: Record<string, string> = {}
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase()
    if (lowerHeader.includes('företagsnamn') || lowerHeader.includes('company_name') || lowerHeader.includes('namn') || lowerHeader.includes('name')) {
      headerMap['company_name'] = header
    } else if (lowerHeader.includes('orgnr') || lowerHeader.includes('organisationsnummer') || lowerHeader.includes('org_number')) {
      headerMap['orgnr'] = header
    } else if (lowerHeader.includes('bolagsform')) {
      headerMap['bolagsform'] = header
    } else if (lowerHeader.includes('ansvarig') && lowerHeader.includes('konsult')) {
      headerMap['ansvarig_konsult'] = header
    } else if (lowerHeader.includes('kontaktperson')) {
      headerMap['kontaktperson'] = header
    } else if (lowerHeader.includes('epost') || lowerHeader.includes('e-post') || lowerHeader.includes('email')) {
      headerMap['epost'] = header
    } else if (lowerHeader.includes('telefon') || lowerHeader.includes('phone')) {
      headerMap['telefon'] = header
    } else if (lowerHeader.includes('räkenskapsår') && lowerHeader.includes('start')) {
      headerMap['räkenskapsår_start'] = header
    } else if (lowerHeader.includes('räkenskapsår') && lowerHeader.includes('slut')) {
      headerMap['räkenskapsår_slut'] = header
    } else if (lowerHeader.includes('tjänster') || lowerHeader.includes('services')) {
      headerMap['tjänster'] = header
    } else if (lowerHeader.includes('fortnox')) {
      headerMap['fortnox_id'] = header
    } else if (lowerHeader.includes('status')) {
      headerMap['status'] = header
    }
  })

  // Ensure company_name is required
  if (!headerMap['company_name']) {
    throw new Error('CSV-filen måste innehålla en kolumn för företagsnamn (företagsnamn, company_name, namn, eller name)')
  }

  // Parse data rows
  const customers: ParsedCustomer[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    
    if (values.length === 0 || values.every(v => !v)) {
      continue // Skip empty rows
    }

    const getValue = (field: string): string | null => {
      const header = headerMap[field]
      if (!header) return null
      const index = headers.indexOf(header)
      if (index === -1 || index >= values.length) return null
      const value = values[index]?.trim()
      return value || null
    }

    const companyName = getValue('company_name')
    if (!companyName) {
      continue // Skip rows without company name
    }

    const statusValue = getValue('status')?.toLowerCase()
    const status: 'Aktiv' | 'Passiv' = 
      statusValue === 'passiv' || statusValue === 'passive' ? 'Passiv' : 'Aktiv'

    customers.push({
      company_name: companyName,
      orgnr: getValue('orgnr'),
      logo_url: null, // Will be fetched later if needed
      bolagsform: getValue('bolagsform'),
      ansvarig_konsult: getValue('ansvarig_konsult'),
      kontaktperson: getValue('kontaktperson'),
      epost: getValue('epost'),
      telefon: getValue('telefon'),
      räkenskapsår_start: getValue('räkenskapsår_start'),
      räkenskapsår_slut: getValue('räkenskapsår_slut'),
      tjänster: getValue('tjänster'),
      fortnox_id: getValue('fortnox_id'),
      status,
    })
  }

  return customers
}

export async function POST(request: NextRequest) {
  try {
    await requireAdministrator()
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil uppladdad' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Endast CSV-filer är tillåtna' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const customers = parseCSV(text)

    if (customers.length === 0) {
      return NextResponse.json(
        { error: 'Inga kunder hittades i CSV-filen' },
        { status: 400 }
      )
    }

    return NextResponse.json({ customers })
  } catch (error: any) {
    console.error('Error parsing CSV:', error)
    return NextResponse.json(
      { error: error.message || 'Ett fel uppstod vid läsning av CSV-filen' },
      { status: 500 }
    )
  }
}

