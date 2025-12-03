import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const user = await requireAdministrator()
    const { customerId } = await params
    const supabase = await createServerSupabase()
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const orgNumber = formData.get('org_number') as string | null
    const contactEmail = formData.get('contact_email') as string | null
    const notes = formData.get('notes') as string | null
    const logoFile = formData.get('logo') as File | null
    const logoUrlParam = formData.get('logo_url') as string | null
    const removeLogo = formData.get('remove_logo') === 'true'

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Verify workspace access
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('workspace_id, logo_url')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Verify workspace membership
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', customer.workspace_id)
      .single()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or member
    const isOwner = workspace.owner_id === user.id
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', customer.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!isOwner && !membership) {
      return NextResponse.json(
        { error: 'You do not have permission to update this customer' },
        { status: 403 }
      )
    }

    let logoUrl: string | null = customer.logo_url

    // Handle logo removal
    if (removeLogo) {
      logoUrl = null
    }
    // Use provided logo URL (e.g., from Brandfetch) if available
    else if (logoUrlParam) {
      logoUrl = logoUrlParam
    }
    // Upload new logo file if provided
    else if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${customerId}-${Date.now()}.${fileExt}`
      const filePath = fileName

      // Convert File to Blob for Supabase upload
      // Next.js FormData files need to be converted properly
      const blob = await logoFile.arrayBuffer()
      const fileBlob = new Blob([blob], { type: logoFile.type || `image/${fileExt}` })

      console.log('Uploading file:', { fileName, filePath, fileSize: logoFile.size, fileType: logoFile.type })

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

      // Generate public URL - verify bucket name matches
      const bucketName = 'customer-logos'
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      // Verify the URL format is correct
      const expectedUrlPattern = `/storage/v1/object/public/${bucketName}/`
      if (!publicUrl.includes(expectedUrlPattern)) {
        console.warn('Public URL format unexpected:', {
          publicUrl,
          expectedPattern: expectedUrlPattern,
          filePath,
        })
      }

      logoUrl = publicUrl
      console.log('Customer logo uploaded successfully:', { 
        filePath, 
        fileName,
        publicUrl,
        uploadData,
        fileExists: files && files.length > 0,
      })
    }

    // Update customer
    const updateData: any = {
      name,
      org_number: orgNumber || null,
      contact_email: contactEmail || null,
      notes: notes || null,
    }

    if (logoUrl !== undefined) {
      updateData.logo_url = logoUrl
    }

    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single()

    if (updateError) {
      console.error('Customer update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update customer: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, customer: updatedCustomer })
  } catch (error: any) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    )
  }
}

