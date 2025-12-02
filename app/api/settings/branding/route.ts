import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    const formData = await request.formData()
    
    const workspaceId = formData.get('workspace_id') as string
    const workspaceName = formData.get('name') as string | null
    const primaryColor = formData.get('primary_color') as string
    const logoFile = formData.get('logo') as File | null

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspace_id' },
        { status: 400 }
      )
    }

    // Verify user owns the workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single()

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    if (workspace.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this workspace' },
        { status: 403 }
      )
    }

    let logoUrl: string | null = null

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      console.log('Starting branding logo upload:', {
        fileName: logoFile.name,
        fileSize: logoFile.size,
        fileType: logoFile.type,
      })

      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${workspaceId}-${Date.now()}.${fileExt}`
      // Upload directly to root of bucket, no subfolder
      const filePath = fileName

      // Convert File to Blob for Supabase upload
      // Next.js FormData files need to be converted properly
      const blob = await logoFile.arrayBuffer()
      const fileBlob = new Blob([blob], { type: logoFile.type || `image/${fileExt}` })

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, fileBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: logoFile.type || `image/${fileExt}`,
        })

      if (uploadError) {
        console.error('Storage upload error details:', {
          error: uploadError,
          message: uploadError.message,
        })
        return NextResponse.json(
          { error: `Failed to upload logo: ${uploadError.message}` },
          { status: 500 }
        )
      }

      if (!uploadData) {
        console.error('Upload returned no data')
        return NextResponse.json(
          { error: 'Upload failed: No data returned' },
          { status: 500 }
        )
      }

      console.log('Upload successful, data:', uploadData)

      // Verify the file exists
      const { data: files, error: listError } = await supabase.storage
        .from('branding')
        .list('', {
          limit: 1000,
        })

      const fileExists = files?.some(f => f.name === fileName)
      console.log('File verification:', {
        fileName,
        fileExists,
        filesFound: files?.length,
        listError: listError?.message,
      })

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath)

      logoUrl = publicUrl
      console.log('Branding logo uploaded successfully:', { 
        filePath, 
        fileName,
        publicUrl,
        uploadData,
        fileExists,
      })
    }

    // Update workspace
    const updateData: any = {
      primary_color: primaryColor,
    }

    if (workspaceName) {
      updateData.name = workspaceName
    }

    if (logoUrl) {
      updateData.logo_url = logoUrl
    }

    const { error: updateError } = await supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', workspaceId)

    if (updateError) {
      console.error('Workspace update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update workspace: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Branding update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update branding' },
      { status: 500 }
    )
  }
}

