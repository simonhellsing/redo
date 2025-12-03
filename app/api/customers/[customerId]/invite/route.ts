import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const { customerId } = await params
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify customer exists and user has access
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, workspace_id')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Create invitation
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    // Check if invitation already exists for this email and customer
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('customer_id', customerId)
      .eq('type', 'customer')
      .is('accepted_at', null)
      .single()

    if (existingInvitation) {
      // Update existing invitation
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existingInvitation.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new invitation
      const { error: insertError } = await supabase
        .from('invitations')
        .insert({
          email,
          token,
          type: 'customer',
          customer_id: customerId,
          workspace_id: customer.workspace_id,
          expires_at: expiresAt.toISOString(),
        })

      if (insertError) {
        throw insertError
      }
    }

    // For dev: return the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const invitationLink = `${baseUrl}/customer/invite/${token}`

    return NextResponse.json({
      success: true,
      invitationLink,
    })
  } catch (error: any) {
    console.error('Error creating customer invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

