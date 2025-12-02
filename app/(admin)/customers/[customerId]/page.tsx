import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { createServerSupabase } from '@/lib/supabase'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { notFound } from 'next/navigation'
import { CustomerDetailContent } from './CustomerDetailContent'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params
  const workspace = await getUserWorkspace()
  const supabase = await createServerSupabase()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('workspace_id', workspace?.id)
    .single()

  // Fix old logo URLs that have double customer-logos path
  // Note: ImageWithFallback component also handles this, but we fix it here for consistency
  if (customer?.logo_url && customer.logo_url.includes('/customer-logos/customer-logos/')) {
    customer.logo_url = customer.logo_url.replace(/\/customer-logos\/customer-logos\//, '/customer-logos/')
  }

  // Debug: Log the logo URL to help troubleshoot
  if (customer?.logo_url) {
    console.log('Customer logo URL:', customer.logo_url)
  }

  if (!customer) {
    notFound()
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  const { data: sourceDocuments } = await supabase
    .from('source_documents')
    .select('*')
    .eq('customer_id', customerId)
    .order('uploaded_at', { ascending: false })

  return (
    <CustomerDetailContent
      customer={customer}
      sourceDocuments={sourceDocuments || []}
      reports={reports || []}
      workspaceId={workspace?.id || ''}
    />
  )
}
