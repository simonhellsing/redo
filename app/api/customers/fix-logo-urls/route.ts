import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextResponse } from 'next/server'

// Utility endpoint to fix old logo URLs that have double customer-logos path
export async function POST() {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()

    // Get all customers with logo URLs
    const { data: customers, error: fetchError } = await supabase
      .from('customers')
      .select('id, logo_url')
      .not('logo_url', 'is', null)

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to fetch customers: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ message: 'No customers with logos found' })
    }

    let fixed = 0
    const updates = []

    for (const customer of customers) {
      if (customer.logo_url && customer.logo_url.includes('/customer-logos/customer-logos/')) {
        // Fix the double path
        const fixedUrl = customer.logo_url.replace(/\/customer-logos\/customer-logos\//, '/customer-logos/')
        
        const { error: updateError } = await supabase
          .from('customers')
          .update({ logo_url: fixedUrl })
          .eq('id', customer.id)

        if (!updateError) {
          fixed++
          updates.push({ id: customer.id, old: customer.logo_url, new: fixedUrl })
        }
      }
    }

    return NextResponse.json({
      message: `Fixed ${fixed} customer logo URLs`,
      total: customers.length,
      updates,
    })
  } catch (error: any) {
    console.error('Error fixing logo URLs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix logo URLs' },
      { status: 500 }
    )
  }
}

