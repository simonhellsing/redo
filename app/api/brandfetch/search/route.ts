import { NextRequest, NextResponse } from 'next/server'

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

    // Search for brand by company name
    const searchResponse = await fetch(
      `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${clientId}`,
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

