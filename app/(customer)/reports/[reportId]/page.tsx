import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { SimulationsSection } from '@/components/customer/SimulationsSection'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>
}) {
  const { reportId } = await params
  const supabase = await createServerSupabase()

  const { data: report } = await supabase
    .from('reports')
    .select('*, customers(*)')
    .eq('id', reportId)
    .eq('status', 'published')
    .single()

  if (!report) {
    notFound()
  }

  const reportContent = report.report_content as any || {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {report.customers?.name || 'Report'} - Financial Report
        </h1>
        {report.period_start && report.period_end && (
          <p className="text-gray-600 mt-2">
            {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
          </p>
        )}
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Revenue</h3>
              <p className="text-2xl font-bold">
                {reportContent.revenue ? `SEK ${reportContent.revenue.toLocaleString()}` : 'N/A'}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Profit</h3>
              <p className="text-2xl font-bold">
                {reportContent.profit ? `SEK ${reportContent.profit.toLocaleString()}` : 'N/A'}
              </p>
            </Card>
            <Card>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Expenses</h3>
              <p className="text-2xl font-bold">
                {reportContent.expenses ? `SEK ${reportContent.expenses.toLocaleString()}` : 'N/A'}
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Report Details</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(reportContent, null, 2)}
            </pre>
          </Card>
        </TabsContent>

        <TabsContent value="simulations">
          <SimulationsSection reportContent={reportContent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

