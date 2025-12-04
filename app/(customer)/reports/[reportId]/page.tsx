import { createAdminSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustomerReportView } from '@/components/customer/CustomerReportView'

import { getCustomerUserInfo } from '@/lib/auth/getCustomerUserInfo'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>
}) {
  const { reportId } = await params
  const adminSupabase = createAdminSupabase()
  const customerInfo = await getCustomerUserInfo()

  if (!customerInfo?.customer) {
    notFound()
  }

  const { data: report } = await adminSupabase
    .from('reports')
    .select('*, customers(*)')
    .eq('id', reportId)
    .eq('status', 'published')
    .eq('customer_id', customerInfo.customer.id)
    .single()

  if (!report) {
    notFound()
  }

  // Only allow viewing the latest published report for this customer.
  const { data: latestReports } = await adminSupabase
    .from('reports')
    .select('id')
    .eq('status', 'published')
    .eq('customer_id', customerInfo.customer.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestReportId = latestReports && latestReports.length > 0 ? latestReports[0].id : null

  if (!latestReportId || latestReportId !== report.id) {
    notFound()
  }

  return (
    <CustomerReportView report={report} />
  )
}

