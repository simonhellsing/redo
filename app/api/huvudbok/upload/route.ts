import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { parseHuvudbokCsvFromText } from '@/lib/huvudbok/parseHuvudbokCsv'
import { calculateKpis, buildMonthlySummaries } from '@/lib/huvudbok/kpiHelpers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
    
    // Verify user is authenticated
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const customerId = formData.get('customer_id') as string
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
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('workspace_id')
        .eq('id', customerId)
        .single()
      
      if (customerError || !customer) {
        console.error('Error fetching customer:', customerError)
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      finalWorkspaceId = customer.workspace_id
    }

    // Verify user has access to this workspace
    const { data: workspaceMember, error: memberError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', finalWorkspaceId)
      .eq('user_id', user.id)
      .single()

    const { data: workspaceOwner, error: ownerError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', finalWorkspaceId)
      .eq('owner_id', user.id)
      .single()

    if (!workspaceMember && !workspaceOwner) {
      console.error('User does not have access to workspace:', {
        user_id: user.id,
        workspace_id: finalWorkspaceId,
        memberError,
        ownerError,
      })
      return NextResponse.json(
        { error: 'You do not have access to this workspace' },
        { status: 403 }
      )
    }

    // Use admin client for inserts to bypass RLS (we've already verified permissions above)
    const adminSupabase = createAdminSupabase()

    // Read file content as text for server-side parsing
    const fileText = await file.text()
    
    // Create a File-like object or use the text directly
    // For server-side, we'll need to parse the text directly
    // Let's create a helper that can parse from text
    const transactions = await parseHuvudbokCsvFromText(fileText, file.name)

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in CSV file' },
        { status: 400 }
      )
    }

    // Calculate KPIs and monthly summaries
    const kpis = calculateKpis(transactions)
    const monthlySummaries = buildMonthlySummaries(transactions)

    // Find period start and end from transactions
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime())
    const periodStart = dates[0] ? dates[0].toISOString().split('T')[0] : null
    const periodEnd = dates[dates.length - 1] ? dates[dates.length - 1].toISOString().split('T')[0] : null

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `huvudbok-${customerId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await adminSupabase.storage
      .from('source-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Create source_document record using admin client (bypasses RLS)
    const { data: sourceDocument, error: sourceDocError } = await adminSupabase
      .from('source_documents')
      .insert({
        workspace_id: finalWorkspaceId,
        customer_id: customerId,
        type: 'general_ledger',
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
      console.error('Error inserting source_document:', {
        error: sourceDocError,
        workspace_id: finalWorkspaceId,
        customer_id: customerId,
        user_id: user.id,
      })
      throw new Error(`Failed to create source document: ${sourceDocError.message}`)
    }

    // Prepare report content with transactions, KPIs, and summaries
    // Convert Date objects to ISO strings for JSON storage
    const transactionsForStorage = transactions.map(t => ({
      accountNumber: t.accountNumber,
      accountName: t.accountName,
      date: t.date.toISOString(),
      text: t.text,
      info: t.info,
      debit: t.debit,
      credit: t.credit,
      balanceAfter: t.balanceAfter,
    }))

    const reportContent = {
      transactions: transactionsForStorage,
      kpis,
      monthlySummaries: monthlySummaries.map(m => ({
        year: m.year,
        month: m.month,
        revenue: m.revenue,
        expenses: m.expenses,
        profit: m.profit,
      })),
      periodStart,
      periodEnd,
      uploadedAt: new Date().toISOString(),
    }

    // Check if there's an existing report for this customer and update it, or create new
    const { data: existingReports } = await adminSupabase
      .from('reports')
      .select('id')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    const existingReport = existingReports && existingReports.length > 0 ? existingReports[0] : null

    let report
    if (existingReport) {
      // Update existing report
      const { data: updatedReport, error: updateError } = await adminSupabase
        .from('reports')
        .update({
          workspace_id: finalWorkspaceId,
          status: 'generated',
          report_content: reportContent,
          period_start: periodStart,
          period_end: periodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReport.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating report:', {
          error: updateError,
          report_id: existingReport.id,
          customer_id: customerId,
        })
        throw new Error(`Failed to update report: ${updateError.message}`)
      }
      report = updatedReport

      // Update the report_source_documents link
      const { error: linkError } = await adminSupabase
        .from('report_source_documents')
        .upsert({
          report_id: report.id,
          source_document_id: sourceDocument.id,
          relation_type: 'primary',
        }, {
          onConflict: 'report_id,source_document_id',
        })

      if (linkError) {
        console.error('Error linking report to source document:', {
          error: linkError,
          report_id: report.id,
          source_document_id: sourceDocument.id,
        })
        throw new Error(`Failed to link report to source document: ${linkError.message}`)
      }
    } else {
      // Create new report
      const { data: newReport, error: reportError } = await adminSupabase
        .from('reports')
        .insert({
          customer_id: customerId,
          workspace_id: finalWorkspaceId,
          status: 'generated',
          report_content: reportContent,
          period_start: periodStart,
          period_end: periodEnd,
        })
        .select()
        .single()

      if (reportError) {
        console.error('Error inserting report:', {
          error: reportError,
          customer_id: customerId,
        })
        throw new Error(`Failed to create report: ${reportError.message}`)
      }
      report = newReport

      // Link source document to report
      const { error: linkError } = await adminSupabase
        .from('report_source_documents')
        .insert({
          report_id: report.id,
          source_document_id: sourceDocument.id,
          relation_type: 'primary',
        })

      if (linkError) {
        console.error('Error linking report to source document:', {
          error: linkError,
          report_id: report.id,
          source_document_id: sourceDocument.id,
        })
        throw new Error(`Failed to link report to source document: ${linkError.message}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      sourceDocumentId: sourceDocument.id,
      uploadedAt: reportContent.uploadedAt,
      transactions: transactionsForStorage,
      kpis,
      monthlySummaries: reportContent.monthlySummaries,
    })
  } catch (error: any) {
    console.error('Error uploading huvudbok:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload huvudbok' },
      { status: 500 }
    )
  }
}

