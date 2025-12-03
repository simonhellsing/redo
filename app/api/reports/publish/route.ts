import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const adminSupabase = createAdminSupabase()
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

    // Get customer email and workspace_id
    const { data: customer } = await supabase
      .from('customers')
      .select('contact_email, workspace_id')
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
        // Update existing invitation using admin client to bypass RLS
        await adminSupabase
          .from('invitations')
          .update({
            token,
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', existingInvitation.id)
      } else {
        // Create new invitation using admin client to bypass RLS
        await adminSupabase
          .from('invitations')
          .insert({
            email: customer.contact_email,
            token,
            type: 'customer',
            customer_id: customerId,
            workspace_id: customer.workspace_id,
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

