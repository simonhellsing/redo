import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Link from 'next/link'
import { PublishReportButton } from './PublishReportButton'

interface Report {
  id: string
  status: 'draft' | 'generated' | 'published'
  period_start: string | null
  period_end: string | null
  created_at: string
  published_at: string | null
}

interface ReportListProps {
  reports: Report[]
  customerId: string
}

export function ReportList({ reports, customerId }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports yet. Upload a supporting document to generate a report.
      </div>
    )
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Period</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Created</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              {report.period_start && report.period_end
                ? `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`
                : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  report.status === 'published'
                    ? 'success'
                    : report.status === 'generated'
                    ? 'info'
                    : 'default'
                }
              >
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(report.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {report.status === 'generated' && (
                  <PublishReportButton reportId={report.id} customerId={customerId} />
                )}
                {report.status === 'published' && (
                  <span className="text-sm text-gray-500">
                    Published {report.published_at ? new Date(report.published_at).toLocaleDateString() : ''}
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

