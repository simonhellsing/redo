import { Text } from '@/components/ui/Text'
import { Tag } from '@/components/ui/Tag'
import { CustomerLedgerReport } from '@/components/admin/CustomerLedgerReport'
import { SimulationsSection } from '@/components/customer/SimulationsSection'
import type { Transaction } from '@/lib/huvudbok/parseHuvudbokCsv'
import {
  MdOutlineUpload,
  MdOutlineCheckCircle,
  MdOutlineErrorOutline,
} from 'react-icons/md'

interface CustomerReportViewProps {
  // Using a flexible type here since the report shape comes directly from Supabase
  report: any
}

export function CustomerReportView({ report }: CustomerReportViewProps) {
  const reportContent = (report?.report_content as any) || {}

  // Reconstruct Transaction objects from stored report_content.transactions
  const transactions: Transaction[] | null = Array.isArray(reportContent.transactions)
    ? reportContent.transactions.map((t: any) => ({
        accountNumber: t.accountNumber,
        accountName: t.accountName,
        date: new Date(t.date),
        text: t.text,
        info: t.info,
        debit: t.debit,
        credit: t.credit,
        balanceAfter: t.balanceAfter,
      }))
    : null

  const uploadedAt = reportContent.uploadedAt ? new Date(reportContent.uploadedAt) : null
  const status: string | undefined = report?.status

  const formatUploadDate = (date: Date): string =>
    new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)

  return (
    <div className="flex flex-col gap-[32px] w-full">
      {/* Status Tags (mirroring admin customer detail page) */}
      <div className="flex items-center gap-2">
        {uploadedAt ? (
          <Tag
            variant="prominent"
            icon={<MdOutlineUpload style={{ width: '14px', height: '14px' }} />}
          >
            Uppladdad {formatUploadDate(uploadedAt)}
          </Tag>
        ) : (
          <Tag
            variant="default"
            icon={<MdOutlineErrorOutline style={{ width: '14px', height: '14px' }} />}
          >
            Ej uppladdad
          </Tag>
        )}

        {status && (
          <Tag
            variant={status === 'published' ? 'positive' : 'default'}
            icon={
              status === 'published' ? (
                <MdOutlineCheckCircle style={{ width: '14px', height: '14px' }} />
              ) : (
                <MdOutlineErrorOutline style={{ width: '14px', height: '14px' }} />
              )
            }
          >
            {status === 'published' ? 'Publicerad' : 'Ej publicerad'}
          </Tag>
        )}
      </div>

      {/* Ledger-style report (same core layout as admin customer detail) */}
      {transactions && transactions.length > 0 ? (
        <CustomerLedgerReport transactions={transactions} />
      ) : (
        <Text
          variant="body-small"
          className="text-[var(--neutral-500)]"
        >
          Rapporten saknar transaktionsdata att visa.
        </Text>
      )}

      {/* Simulations section below the main report */}
      <div className="mt-4">
        <SimulationsSection reportContent={reportContent} />
      </div>
    </div>
  )
}


