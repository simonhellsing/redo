import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'

// Utility endpoint to verify if a file exists in storage
export async function GET(request: NextRequest) {
  try {
    await requireAdministrator()
    const supabase = await createServerSupabase()
    
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')
    const filePath = searchParams.get('path')

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Missing bucket or path parameter' },
        { status: 400 }
      )
    }

    // Try to get the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(filePath.split('/').slice(0, -1).join('/') || '', {
        limit: 100,
        search: filePath.split('/').pop() || '',
      })

    // Also try to get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({
      exists: !error && data && data.length > 0,
      files: data,
      publicUrl,
      error: error?.message,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify file' },
      { status: 500 }
    )
  }
}


