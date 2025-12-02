import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    const formData = await request.formData()
    
    const workspaceId = formData.get('workspace_id') as string
    const name = formData.get('name') as string
    const orgNumber = formData.get('org_number') as string | null
    const contactEmail = formData.get('contact_email') as string | null
    const notes = formData.get('notes') as string | null
    const logoFile = formData.get('logo') as File | null

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: 'Missing workspace_id or name' },
        { status: 400 }
      )
    }

    let logoUrl: string | null = null

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      console.log('Starting logo upload:', {
        fileName: logoFile.name,
        fileSize: logoFile.size,
        fileType: logoFile.type,
      })

      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = fileName

      // Convert File to Blob for Supabase upload
      // Next.js FormData files need to be converted properly
      const blob = await logoFile.arrayBuffer()
      const fileBlob = new Blob([blob], { type: logoFile.type || `image/${fileExt}` })

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-logos')
        .upload(filePath, fileBlob, {
          cacheControl: '3600',
          upsert: false,
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

      // Verify the file exists by listing files
      const { data: files, error: listError } = await supabase.storage
        .from('customer-logos')
        .list('', {
          limit: 1000,
        })

      const fileExists = files?.some(f => f.name === fileName)
      console.log('File verification:', {
        fileName,
        fileExists,
        filesFound: files?.length,
        allFileNames: files?.map(f => f.name),
        listError: listError?.message,
      })

      if (!fileExists) {
        console.error('File was not found after upload!')
        return NextResponse.json(
          { error: 'File upload may have failed - file not found in storage' },
          { status: 500 }
        )
      }

      const { data: { publicUrl } } = supabase.storage
        .from('customer-logos')
        .getPublicUrl(filePath)

      logoUrl = publicUrl
      console.log('Customer logo uploaded successfully:', { 
        filePath, 
        fileName,
        publicUrl,
        uploadData,
      })
    }

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        workspace_id: workspaceId,
        name,
        org_number: orgNumber || null,
        contact_email: contactEmail || null,
        notes: notes || null,
        logo_url: logoUrl,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Customer creation error:', customerError)
      return NextResponse.json(
        { error: `Failed to create customer: ${customerError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, customer })
  } catch (error: any) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}

