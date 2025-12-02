import { createServerSupabase } from '@/lib/supabase'
import { requireAdministrator } from '@/lib/auth/requireAdministrator'
import { NextRequest, NextResponse } from 'next/server'
import { parseHuvudbokCsv } from '@/lib/huvudbok/parseHuvudbokCsv'
import { calculateKpis, buildMonthlySummaries } from '@/lib/huvudbok/kpiHelpers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdministrator()
    const supabase = await createServerSupabase()
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

    // Parse the CSV file
    const transactions = await parseHuvudbokCsv(file)

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
      throw sourceDocError
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
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let report
    if (existingReport) {
      // Update existing report
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update({
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
        throw updateError
      }
      report = updatedReport

      // Update the report_source_documents link
      await supabase
        .from('report_source_documents')
        .upsert({
          report_id: report.id,
          source_document_id: sourceDocument.id,
          relation_type: 'primary',
        }, {
          onConflict: 'report_id,source_document_id',
        })
    } else {
      // Create new report
      const { data: newReport, error: reportError } = await supabase
        .from('reports')
        .insert({
          customer_id: customerId,
          status: 'generated',
          report_content: reportContent,
          period_start: periodStart,
          period_end: periodEnd,
        })
        .select()
        .single()

      if (reportError) {
        throw reportError
      }
      report = newReport

      // Link source document to report
      await supabase
        .from('report_source_documents')
        .insert({
          report_id: report.id,
          source_document_id: sourceDocument.id,
          relation_type: 'primary',
        })
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

