import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    const { name } = await request.json()

    // Check if user already has a workspace
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (existingWorkspace) {
      return NextResponse.json({ workspace: existingWorkspace })
    }

    // Create workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        name: name || `${user.profile?.name || 'My'}'s Workspace`,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ workspace })
  } catch (error: any) {
    console.error('Error creating workspace:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create workspace' },
      { status: 500 }
    )
  }
}

