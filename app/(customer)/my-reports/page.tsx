import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getCustomerUserInfo } from '@/lib/auth/getCustomerUserInfo'
import { CustomerReportView } from '@/components/customer/CustomerReportView'
import { CustomerReportHeader } from '@/components/customer/CustomerReportHeader'

export default async function MyReportsPage() {
  const user = await getCurrentUser()
  const customerInfo = await getCustomerUserInfo()

  if (!customerInfo?.customer) {
    return (
      <div className="flex flex-col gap-[16px] w-full">
        <Text variant="title-large" className="text-[var(--neutral-900)]">
          Rapport
        </Text>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen kund kopplad till ditt konto.</p>
          </div>
        </Card>
      </div>
    )
  }

  // Get the latest published report for this customer
  const adminSupabase = createAdminSupabase()
  const { data: reports } = await adminSupabase
    .from('reports')
    .select('*, customers(*)')
    .eq('status', 'published')
    .eq('customer_id', customerInfo.customer.id)
    .order('created_at', { ascending: false })

  const latestReport = reports && reports.length > 0 ? reports[0] : null

  const latestReportPeriod =
    latestReport && latestReport.period_start && latestReport.period_end
      ? `${new Date(latestReport.period_start).toLocaleDateString('sv-SE')} \u2013 ${new Date(
          latestReport.period_end
        ).toLocaleDateString('sv-SE')}`
      : undefined

  if (!latestReport) {
    return (
      <div className="flex flex-col gap-[16px] w-full">
        <CustomerReportHeader
          customerName={customerInfo.customer.name}
          orgNumber={latestReportPeriod}
          logoUrl={customerInfo.customer.logo_url}
          disableDownload
        />
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Inga publicerade rapporter tillgängliga</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[16px] w-full">
      <CustomerReportHeader
        customerName={customerInfo.customer.name}
        orgNumber={latestReportPeriod}
        logoUrl={customerInfo.customer.logo_url}
      />

      <div className="rounded-[12px] w-full min-h-[400px] pt-[20px] pb-[40px] px-[8%]">
        <CustomerReportView report={latestReport} />
      </div>
    </div>
  )
}

