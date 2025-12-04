import { ButtonLink } from '@/components/ui/ButtonLink'
import { CustomerReportView } from '@/components/customer/CustomerReportView'
import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function CustomerReportPreviewPage({
  params,
}: {
  params: Promise<{ customerId: string; reportId: string }>
}) {
  const { customerId, reportId } = await params
  const supabase = await createServerSupabase()

  const { data: report } = await supabase
    .from('reports')
    .select('*, customers(*)')
    .eq('id', reportId)
    .eq('customer_id', customerId)
    .eq('status', 'published')
    .single()

  if (!report) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-800">
            Förhandsgranskar kundvy
          </p>
          <p className="text-xs text-yellow-700">
            Du ser nu rapporten så som kunden ser den.
          </p>
        </div>
        <ButtonLink
          href={`/customers/${customerId}`}
          variant="outline"
          size="sm"
        >
          Tillbaka till kund
        </ButtonLink>
      </div>

      <main className="max-w-5xl mx-auto py-8 px-4">
        <CustomerReportView report={report} />
      </main>
    </div>
  )
}


