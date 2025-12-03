import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

async function fetchLogoForCompany(companyName: string, retries = 2): Promise<string | null> {
  const clientId = process.env.BRANDFETCH_CLIENT_ID
  if (!clientId) {
    console.warn('BRANDFETCH_CLIENT_ID not configured')
    return null
  }

  // Clean company name - remove common suffixes and extra whitespace
  const cleanName = companyName.trim().replace(/\s+/g, ' ')
  
  if (!cleanName) {
    return null
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // Add delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const searchResponse = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(cleanName)}?c=${clientId}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text().catch(() => 'Unknown error')
        console.warn(`Brandfetch API error for "${cleanName}": ${searchResponse.status} - ${errorText}`)
        
        // If rate limited, wait longer before retry
        if (searchResponse.status === 429 && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
          continue
        }
        
        return null
      }

      const searchData = await searchResponse.json()

      if (!searchData || !Array.isArray(searchData) || searchData.length === 0) {
        console.log(`No results found for "${cleanName}"`)
        return null
      }

      const firstResult = searchData[0]
      const domain = firstResult?.domain

      if (!domain) {
        console.log(`No domain found for "${cleanName}"`)
        return null
      }

      // Construct the logo URL (Brandfetch requires hotlinking)
      const logoUrl = `https://cdn.brandfetch.io/${domain}?c=${clientId}`
      console.log(`Successfully fetched logo for "${cleanName}": ${logoUrl}`)
      return logoUrl
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`Request timeout for "${cleanName}"`)
      } else {
        console.error(`Error fetching logo for "${cleanName}" (attempt ${attempt + 1}/${retries + 1}):`, error.message || error)
      }
      
      // If this was the last attempt, return null
      if (attempt === retries) {
        return null
      }
    }
  }

  return null
}

// Helper function to batch requests with delay - process sequentially with delays
async function fetchLogosInBatches(
  customers: ParsedCustomer[],
  delayBetweenRequests = 1000 // 1 second between each request
): Promise<ParsedCustomer[]> {
  const results: ParsedCustomer[] = []
  
  console.log(`Fetching logos for ${customers.length} customers sequentially with ${delayBetweenRequests}ms delay`)
  
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i]
    console.log(`Fetching logo ${i + 1}/${customers.length} for "${customer.company_name}"`)
    
    const logoUrl = await fetchLogoForCompany(customer.company_name)
    results.push({
      ...customer,
      logo_url: logoUrl,
    })
    
    // Add delay between requests (except for the last one)
    if (i < customers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
    }
  }
  
  return results
}

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

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current.trim())
  
  return result
}

function parseCSV(csvText: string): ParsedCustomer[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV-filen måste innehålla minst en rubrikrad och en datarad')
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''))
  
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
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''))
    
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

    console.log(`Parsed ${customers.length} customers from CSV`)

    // Return customers without logos - logos will be fetched progressively on the frontend
    // This allows for better UX with loading states and avoids backend timeout issues
    return NextResponse.json({ customers })
  } catch (error: any) {
    console.error('Error parsing CSV:', error)
    return NextResponse.json(
      { error: error.message || 'Ett fel uppstod vid läsning av CSV-filen' },
      { status: 500 }
    )
  }
}

