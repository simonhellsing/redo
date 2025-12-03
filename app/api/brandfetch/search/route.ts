import { NextRequest, NextResponse } from 'next/server'

// Function to remove Swedish company suffixes (bolagsform) from company names
// Only removes suffixes that have a space before them (e.g., "Volvo AB" -> "Volvo", but "VolvoAB" stays "VolvoAB")
function cleanCompanyName(companyName: string): string {
  let cleaned = companyName.trim()
  
  // Common Swedish company suffixes to remove (only if they have a space before them)
  const endSuffixes = [
    /\s+Förening\s*$/i,     // Förening (with space)
    /\s+AB\s*$/i,           // Aktiebolag (with space)
    /\s+EF\s*$/i,           // Enskild firma (with space)
    /\s+HB\s*$/i,           // Handelsbolag (with space)
  ]
  
  // Remove suffixes from the end (only if they have a space before them)
  for (const suffix of endSuffixes) {
    cleaned = cleaned.replace(suffix, '')
  }
  
  return cleaned.trim()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      )
    }

    const clientId = process.env.BRANDFETCH_CLIENT_ID

    if (!clientId) {
      return NextResponse.json(
        { error: 'Brandfetch client ID not configured' },
        { status: 500 }
      )
    }

    // Clean the company name to remove bolagsform
    const cleanedQuery = cleanCompanyName(query)
    console.log(`Searching for: "${cleanedQuery}" (original: "${query}")`)

    // Search for brand by company name
    const searchResponse = await fetch(
      `https://api.brandfetch.io/v2/search/${encodeURIComponent(cleanedQuery)}?c=${clientId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('Brandfetch search error:', errorText)
      return NextResponse.json(
        { error: 'Failed to search for brand' },
        { status: searchResponse.status }
      )
    }

    const searchData = await searchResponse.json()

    // Extract the first result's domain
    if (!searchData || !Array.isArray(searchData) || searchData.length === 0) {
      return NextResponse.json({ logoUrl: null, domain: null })
    }

    const firstResult = searchData[0]
    const domain = firstResult.domain

    if (!domain) {
      return NextResponse.json({ logoUrl: null, domain: null })
    }

    // Construct the logo URL (Brandfetch requires hotlinking)
    const logoUrl = `https://cdn.brandfetch.io/${domain}?c=${clientId}`

    return NextResponse.json({ 
      logoUrl,
      domain,
      brandName: firstResult.name || query
    })
  } catch (error: any) {
    console.error('Brandfetch API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logo' },
      { status: 500 }
    )
  }
}

