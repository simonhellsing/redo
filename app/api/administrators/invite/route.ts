import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    const adminSupabase = createAdminSupabase()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get current user's workspace
    const workspace = await getUserWorkspace()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Create invitation
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

    // Check if invitation already exists for this email
    const { data: existingInvitation, error: checkError } = await adminSupabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('type', 'administrator')
      .eq('workspace_id', workspace.id)
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
          type: 'administrator',
          workspace_id: workspace.id,
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

    // For dev: return the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const invitationLink = `${baseUrl}/admin/invite/${token}`

    console.log('Returning invitation link:', invitationLink)

    return NextResponse.json({
      success: true,
      invitationLink,
      token, // Include token for debugging
    })
  } catch (error: any) {
    console.error('Error creating administrator invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

