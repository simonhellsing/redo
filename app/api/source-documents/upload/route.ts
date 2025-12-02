import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { generateReportFromSourceDocuments } from '@/lib/reports/generateReport'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const customerId = formData.get('customer_id') as string
    const documentType = (formData.get('document_type') as string) || 'general_ledger'
    const workspaceId = formData.get('workspace_id') as string

    if (!file || !customerId || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing file, customer_id, or workspace_id' },
        { status: 400 }
      )
    }

    // Get workspace_id from customer if not provided
    let finalWorkspaceId = workspaceId
    if (!finalWorkspaceId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('workspace_id')
        .eq('id', customerId)
        .single()
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      finalWorkspaceId = customer.workspace_id
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${customerId}-${Date.now()}.${fileExt}`
    // Upload directly to root of bucket, no subfolder
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('source-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Create source_document record
    const { data: sourceDocument, error: sourceDocError } = await supabase
      .from('source_documents')
      .insert({
        workspace_id: finalWorkspaceId,
        customer_id: customerId,
        type: documentType,
        storage_path: filePath,
        uploaded_by: user.id,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        },
      })
      .select()
      .single()

    if (sourceDocError) {
      throw sourceDocError
    }

    // Generate report from source document(s)
    const reportContent = await generateReportFromSourceDocuments([sourceDocument.id])

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        customer_id: customerId,
        status: 'generated',
        report_content: reportContent,
        period_start: reportContent.period_start || null,
        period_end: reportContent.period_end || null,
      })
      .select()
      .single()

    if (reportError) {
      throw reportError
    }

    // Link source document to report
    await supabase
      .from('report_source_documents')
      .insert({
        report_id: report.id,
        source_document_id: sourceDocument.id,
        relation_type: 'primary',
      })

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      sourceDocumentId: sourceDocument.id,
    })
  } catch (error: any) {
    console.error('Error uploading source document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload source document' },
      { status: 500 }
    )
  }
}

