import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { invitationId, userId, userEmail } = await request.json()

    if (!invitationId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Invitation ID, userId and userEmail are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabase()

    // Load the invitation using the admin client (bypasses RLS)
    const { data: invitation, error: invitationError } = await adminSupabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('type', 'customer')
      .is('accepted_at', null)
      .single()

    if (invitationError || !invitation) {
      console.error('Failed to load invitation for accept-invitation:', invitationError, {
        invitationId,
      })
      return NextResponse.json(
        { error: 'Invitation not found or already accepted' },
        { status: 400 }
      )
    }

    // Basic safety: ensure the invitation email matches the logged-in user
    if (invitation.email && invitation.email.toLowerCase() !== (userEmail || '').toLowerCase()) {
      console.error('Invitation email does not match logged-in user email', {
        invitationEmail: invitation.email,
        userEmail,
        userId,
      })
      return NextResponse.json(
        { error: 'Invitation email does not match the logged-in user' },
        { status: 403 }
      )
    }

    if (!invitation.customer_id || !invitation.workspace_id) {
      console.error('Invitation is missing customer_id or workspace_id', {
        invitationId: invitation.id,
        customer_id: invitation.customer_id,
        workspace_id: invitation.workspace_id,
      })
      return NextResponse.json(
        { error: 'Invitation is missing customer or workspace information' },
        { status: 400 }
      )
    }

    // Link user to customer in customer_users table using admin client to bypass RLS
    const { error: customerUserError } = await adminSupabase
      .from('customer_users')
      .upsert(
        {
          user_id: userId,
          customer_id: invitation.customer_id,
          workspace_id: invitation.workspace_id,
        },
        {
          onConflict: 'workspace_id,customer_id,user_id',
        }
      )

    if (customerUserError) {
      console.error('Failed to upsert customer_users during accept-invitation:', {
        error: customerUserError,
        userId,
        customerId: invitation.customer_id,
        workspaceId: invitation.workspace_id,
      })
      return NextResponse.json(
        { error: 'Failed to link user to customer' },
        { status: 500 }
      )
    }

    // Mark invitation as accepted
    const { error: updateInvitationError } = await adminSupabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    if (updateInvitationError) {
      console.error('Failed to mark invitation as accepted:', {
        error: updateInvitationError,
        invitationId: invitation.id,
      })
      return NextResponse.json(
        { error: 'Failed to update invitation status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unexpected error in customers/accept-invitation route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}


