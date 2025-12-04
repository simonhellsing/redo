import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

// Utility endpoint to check bucket status and list files
export async function GET(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('bucket') || 'customer-logos'

    // List buckets to see what exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    // List files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 })

    // Try to get a public URL for the first file if it exists
    let sampleUrl = null
    if (files && files.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(files[0].name)
      sampleUrl = publicUrl
    }

    return NextResponse.json({
      bucketName,
      buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
      files: files?.map(f => f.name),
      filesCount: files?.length,
      sampleUrl,
      errors: {
        buckets: bucketsError?.message,
        files: filesError?.message,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check bucket' },
      { status: 500 }
    )
  }
}



