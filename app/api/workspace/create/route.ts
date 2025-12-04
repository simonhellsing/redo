import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    const contentType = request.headers.get('content-type') || ''

    let name: string | null = null
    let primaryColor: string | null = null
    let logoFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = (formData.get('name') as string | null) || null
      primaryColor = (formData.get('primary_color') as string | null) || null
      logoFile = (formData.get('logo') as File | null) || null
    } else {
      const body = await request.json().catch(() => null)
      if (body) {
        name = body.name ?? null
        primaryColor = body.primary_color ?? null
      }
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      )
    }

    // Check if user already has a workspace
    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    let workspace = existingWorkspace

    if (!workspace) {
      // Create workspace
      const { data: createdWorkspace, error } = await supabase
        .from('workspaces')
        .insert({
          name: name || `${user.profile?.name || 'My'}'s Workspace`,
          owner_id: user.id,
          primary_color: primaryColor || '#3b82f6',
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      workspace = createdWorkspace
    }

    // If we have branding data, apply it (both for new and existing workspaces)
    if (workspace && (primaryColor || (logoFile && logoFile.size > 0))) {
      let logoUrl: string | null = null

      if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${workspace.id}-${Date.now()}.${fileExt}`
        const filePath = fileName

        const blob = await logoFile.arrayBuffer()
        const fileBlob = new Blob([blob], { type: logoFile.type || `image/${fileExt}` })

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('branding')
          .upload(filePath, fileBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: logoFile.type || `image/${fileExt}`,
          })

        if (uploadError || !uploadData) {
          console.error('Failed to upload workspace logo during creation:', uploadError)
          return NextResponse.json(
            { error: `Failed to upload logo: ${uploadError?.message || 'Unknown error'}` },
            { status: 500 }
          )
        }

        const { data: { publicUrl } } = supabase.storage
          .from('branding')
          .getPublicUrl(filePath)

        logoUrl = publicUrl
      }

      const updateData: any = {}
      if (primaryColor) {
        updateData.primary_color = primaryColor
      }
      if (logoUrl) {
        updateData.logo_url = logoUrl
      }

      if (Object.keys(updateData).length > 0) {
        const { data: updatedWorkspace, error: updateError } = await supabase
          .from('workspaces')
          .update(updateData)
          .eq('id', workspace.id)
          .select()
          .single()

        if (updateError) {
          console.error('Failed to update workspace branding during creation:', updateError)
          return NextResponse.json(
            { error: `Failed to update workspace: ${updateError.message}` },
            { status: 500 }
          )
        }

        workspace = updatedWorkspace
      }
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

