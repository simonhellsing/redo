import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const workspace = await getUserWorkspace()

  if (!workspace) {
      redirect('/overview/workspace-setup')
  }

  const user = await getCurrentUser()
  const supabase = await createServerSupabase()
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, logo_url, org_number')
    .eq('workspace_id', workspace.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
  }

  // Get reports for each customer to show status
  const customersWithReports = await Promise.all(
    (customers || []).map(async (customer) => {
      const { data: reports } = await supabase
        .from('reports')
        .select('id, status')
        .eq('customer_id', customer.id)
        .limit(1)
      
      const hasPublishedReport = reports ? reports.some(r => r.status === 'published') : false
      const hasSourceDocument = await supabase
        .from('source_documents')
        .select('id')
        .eq('customer_id', customer.id)
        .limit(1)
        .single()
        .then(({ data }) => !!data)

      return {
        ...customer,
        hasPublishedReport: hasPublishedReport ?? false,
        hasSourceDocument: hasSourceDocument ?? false,
      }
    })
  )

  return (
    <DashboardContent
      userName={user?.profile?.name || user?.email?.split('@')[0] || 'User'}
      customers={customersWithReports}
      workspaceId={workspace.id}
    />
  )
}

