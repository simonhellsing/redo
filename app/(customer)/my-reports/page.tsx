import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Badge } from '@/components/ui/Badge'
import { createServerSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export default async function MyReportsPage() {
  const user = await getCurrentUser()
  const supabase = await createServerSupabase()

  // For MVP, we'll need to link customers to users
  // For now, this is a placeholder - you'll need to add a customer_users table
  // or handle this differently based on your invitation flow
  
  // Placeholder: Get published reports (this will need proper customer-user linking)
  const { data: reports } = await supabase
    .from('reports')
    .select('*, customers(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reports</h1>

      {reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report: any) => (
            <Card key={report.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">
                  {report.customers?.name || 'Report'}
                </h3>
                <Badge variant="success">Published</Badge>
              </div>
              {report.period_start && report.period_end && (
                <p className="text-sm text-gray-600 mb-4">
                  {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                </p>
              )}
              <ButtonLink href={`/reports/${report.id}`} variant="outline" size="sm" className="w-full">
                View Report
              </ButtonLink>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No published reports available</p>
          </div>
        </Card>
      )}
    </div>
  )
}

