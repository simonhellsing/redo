import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const { reportId, customerId } = await request.json()

    // Update report status
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (updateError) {
      throw updateError
    }

    // Get customer email
    const { data: customer } = await supabase
      .from('customers')
      .select('contact_email')
      .eq('id', customerId)
      .single()

    if (customer?.contact_email) {
      // Create or update invitation
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('invitations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('type', 'customer')
        .is('accepted_at', null)
        .single()

      if (existingInvitation) {
        // Update existing invitation
        await supabase
          .from('invitations')
          .update({
            token,
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', existingInvitation.id)
      } else {
        // Create new invitation
        await supabase
          .from('invitations')
          .insert({
            email: customer.contact_email,
            token,
            type: 'customer',
            customer_id: customerId,
            expires_at: expiresAt.toISOString(),
          })
      }

      // For dev: return the invitation link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const invitationLink = `${baseUrl}/customer/invite/${token}`

      return NextResponse.json({
        success: true,
        invitationLink,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error publishing report:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish report' },
      { status: 500 }
    )
  }
}

