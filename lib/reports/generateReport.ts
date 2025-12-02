// Stubbed report generation function
// This will be replaced with actual document parsing and business logic later

import { createServerSupabase } from '@/lib/supabase'

export async function generateReportFromSourceDocuments(
  sourceDocumentIds: string[]
): Promise<any> {
  // For MVP, return stubbed data
  // Later, this will parse the documents and extract real financial data
  
  const supabase = await createServerSupabase()
  
  // Fetch source documents metadata
  const { data: sourceDocuments } = await supabase
    .from('source_documents')
    .select('*')
    .in('id', sourceDocumentIds)

  if (!sourceDocuments || sourceDocuments.length === 0) {
    throw new Error('No source documents found')
  }

  // For now, just use the first document's metadata
  const primaryDoc = sourceDocuments[0]
  const totalRows = sourceDocuments.reduce((sum, doc) => {
    const metadata = doc.metadata as any
    return sum + (metadata?.row_count || 0)
  }, 0)
  
  // Simple stub: return dummy structured data
  return {
    revenue: 1000000,
    expenses: 750000,
    profit: 250000,
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    metadata: {
      source_document_count: sourceDocuments.length,
      source_document_types: sourceDocuments.map(doc => doc.type),
      generated_at: new Date().toISOString(),
    },
    // Placeholder for future structured data
    accounts: [],
    transactions: [],
  }
}

// Legacy function for backward compatibility (deprecated)
export async function generateReportFromHuvudbok(file: File): Promise<any> {
  // This is kept for backward compatibility but should not be used
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  
  return {
    revenue: 1000000,
    expenses: 750000,
    profit: 250000,
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    metadata: {
      row_count: lines.length,
      file_name: file.name,
      generated_at: new Date().toISOString(),
    },
    accounts: [],
    transactions: [],
  }
}
