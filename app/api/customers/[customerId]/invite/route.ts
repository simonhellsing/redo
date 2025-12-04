import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getBaseUrl } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const adminSupabase = createAdminSupabase()
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
    // Use admin client to bypass RLS for this check
    const { data: existingInvitation, error: checkError } = await adminSupabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('customer_id', customerId)
      .eq('type', 'customer')
      .is('accepted_at', null)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for existing invitation:', checkError)
      // Continue anyway - might be a new invitation
    }

    if (existingInvitation) {
      // Update existing invitation using admin client to bypass RLS
      const { data: updatedInvitation, error: updateError } = await adminSupabase
        .from('invitations')
        .update({
          token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existingInvitation.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating invitation:', updateError)
        throw updateError
      }
      console.log('Updated invitation:', updatedInvitation)
    } else {
      // Create new invitation using admin client to bypass RLS
      const { data: newInvitation, error: insertError } = await adminSupabase
        .from('invitations')
        .insert({
          email,
          token,
          type: 'customer',
          customer_id: customerId,
          workspace_id: customer.workspace_id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting invitation:', insertError)
        throw insertError
      }
      console.log('Created invitation:', newInvitation)
      
      // Verify the invitation was actually saved by querying it back
      const { data: verifyInvitation, error: verifyError } = await adminSupabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()
      
      if (verifyError || !verifyInvitation) {
        console.error('Failed to verify invitation was saved:', verifyError)
        throw new Error('Invitation was created but could not be verified')
      }
      console.log('Verified invitation exists:', verifyInvitation)
    }

    // Return the invitation link (used in both dev and production)
    const baseUrl = getBaseUrl(request)
    const invitationLink = `${baseUrl}/customer/invite/${token}`

    console.log('Returning invitation link:', invitationLink)

    return NextResponse.json({
      success: true,
      invitationLink,
      token, // Include token for debugging
    })
  } catch (error: any) {
    console.error('Error creating customer invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

