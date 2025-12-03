'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Divider } from '@/components/ui/Divider'
import { Button } from '@/components/ui/Button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Illustration } from '@/components/ui/Illustration'
import { Text } from '@/components/ui/Text'
import { SourceDocumentUploadForm } from '@/components/admin/SourceDocumentUploadForm'
import { EditCustomerButton } from '@/components/admin/EditCustomerButton'
import { CustomerLedgerReport } from '@/components/admin/CustomerLedgerReport'
import { InviteCustomerUserButton } from '@/components/admin/InviteCustomerUserButton'
import { PublishReportModal } from '@/components/admin/PublishReportModal'
import { parseHuvudbokCsv, Transaction } from '@/lib/huvudbok/parseHuvudbokCsv'
import { MdOutlineUpload, MdOutlinePublish } from 'react-icons/md'

interface Customer {
  id: string
  name: string
  logo_url?: string | null
  org_number?: string | null
  contact_email?: string | null
  notes?: string | null
}

interface SourceDocument {
  id: string
  customer_id: string
  document_type: string
  file_name: string
  uploaded_at: string
}

interface Report {
  id: string
  customer_id: string
  status: string
  created_at: string
  report_content?: {
    transactions?: Array<{
      accountNumber: string
      accountName: string
      date: string // ISO string
      text: string
      info: string
      debit: number
      credit: number
      balanceAfter: number | null
    }>
    kpis?: any
    monthlySummaries?: any
    uploadedAt?: string
  }
}

interface CustomerDetailContentProps {
  customer: Customer
  sourceDocuments: SourceDocument[]
  reports: Report[]
  workspaceId: string
  latestReport?: Report | null
  latestHuvudbokUploadedAt?: string | null
}

export function CustomerDetailContent({
  customer,
  sourceDocuments,
  reports,
  workspaceId,
  latestReport,
  latestHuvudbokUploadedAt,
}: CustomerDetailContentProps) {
  const router = useRouter()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[] | null>(() => {
    // Load transactions from latest report if available
    if (latestReport?.report_content?.transactions) {
      return latestReport.report_content.transactions.map(t => ({
        accountNumber: t.accountNumber,
        accountName: t.accountName,
        date: new Date(t.date),
        text: t.text,
        info: t.info,
        debit: t.debit,
        credit: t.credit,
        balanceAfter: t.balanceAfter,
      }))
    }
    return null
  })
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploadedAt, setUploadedAt] = useState<Date | null>(() => {
    // Load upload date from latest report or source document
    if (latestReport?.report_content?.uploadedAt) {
      return new Date(latestReport.report_content.uploadedAt)
    }
    if (latestHuvudbokUploadedAt) {
      return new Date(latestHuvudbokUploadedAt)
    }
    return null
  })
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const customerLogo = customer.logo_url ? (
    <ImageWithFallback
      src={customer.logo_url}
      alt={`${customer.name} logo`}
      className="w-full h-full object-cover rounded-[8px]"
    />
  ) : (
    <div className="w-full h-full bg-[var(--neutral-200)] rounded-[8px]" />
  )

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setParseError(null)

    try {
      // Upload to API which will parse and save to database
      const formData = new FormData()
      formData.append('file', file)
      formData.append('customer_id', customer.id)
      formData.append('workspace_id', workspaceId)

      const response = await fetch('/api/huvudbok/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload huvudbok')
      }

      const data = await response.json()

      // Convert ISO date strings back to Date objects
      const parsedTransactions: Transaction[] = data.transactions.map((t: any) => ({
        accountNumber: t.accountNumber,
        accountName: t.accountName,
        date: new Date(t.date),
        text: t.text,
        info: t.info,
        debit: t.debit,
        credit: t.credit,
        balanceAfter: t.balanceAfter,
      }))

      setTransactions(parsedTransactions)
      setUploadedAt(new Date(data.uploadedAt))

      // Refresh the page to get updated data from server
      router.refresh()
    } catch (error) {
      setParseError(
        error instanceof Error
          ? error.message
          : 'Kunde inte läsa in huvudboken. Kontrollera filformatet och försök igen.'
      )
    } finally {
      setIsParsing(false)
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const hasSourceDocuments = sourceDocuments.length > 0
  const hasTransactions = transactions && transactions.length > 0
  const canPublish = hasSourceDocuments && latestReport && latestReport.status === 'generated'

  async function handlePublish() {
    if (!latestReport) return

    setIsPublishing(true)
    try {
      const response = await fetch('/api/reports/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: latestReport.id, customerId: customer.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish report')
      }

      const data = await response.json()
      
      // Show invitation link (for dev)
      if (data.invitationLink) {
        console.log('Invitation link:', data.invitationLink)
      }

      setShowPublishModal(false)
      router.refresh()
    } catch (error) {
      console.error('Error publishing report:', error)
      alert('Kunde inte publicera rapporten. Försök igen.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Format upload date for display
  const formatUploadDate = (date: Date): string => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Determine status text
  const statusText = uploadedAt
    ? `Uppladdad (${formatUploadDate(uploadedAt)})`
    : 'Ej uppladdad'

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {/* PageHeader */}
      <PageHeader
        logo={customerLogo}
        title={customer.name}
        subtitle={
          <div className="flex items-center gap-2">
            {customer.org_number && (
              <Text
                variant="label-small"
                className="text-[var(--neutral-500)] whitespace-nowrap"
              >
                {customer.org_number}
              </Text>
            )}
            <Text
              variant="label-small"
              className={
                uploadedAt
                  ? 'text-[var(--positive-500)] whitespace-nowrap'
                  : 'text-[var(--neutral-500)] whitespace-nowrap'
              }
            >
              {statusText}
            </Text>
          </div>
        }
        actions={
          <>
            {canPublish && (
              <Button
                variant="primary"
                size="small"
                leftIcon={<MdOutlinePublish />}
                onClick={() => setShowPublishModal(true)}
              >
                Publicera
              </Button>
            )}
            <InviteCustomerUserButton customerId={customer.id} customerName={customer.name} />
            <EditCustomerButton
              customer={{
                id: customer.id,
                name: customer.name,
                org_number: customer.org_number || null,
                contact_email: customer.contact_email || null,
                notes: customer.notes || null,
                logo_url: customer.logo_url || null,
              }}
            >
              Redigera kund
            </EditCustomerButton>
            <Button
              variant="primary"
              size="small"
              leftIcon={<MdOutlineUpload />}
              onClick={handleUploadClick}
              disabled={isParsing}
            >
              {isParsing ? 'Laddar...' : 'Ladda upp huvudbok'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-hidden="true"
            />
          </>
        }
      />

      {/* Divider */}
      <Divider />

      {/* PageContent */}
      <div className="flex flex-col gap-[40px] items-center justify-center pb-[80px] pt-[20px] px-[8%] rounded-[12px] w-full min-h-[400px]">
        {isParsing ? (
          // Loading State
          <div className="flex flex-col gap-[12px] items-center shrink-0 w-[240px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            <div className="text-center m-0 p-0">
              <Text
                variant="label-small"
                className="text-[var(--neutral-500)] leading-[16px] m-0 p-0"
              >
                Laddar huvudbok...
              </Text>
            </div>
          </div>
        ) : parseError ? (
          // Error State
          <div className="flex flex-col gap-[12px] items-center shrink-0 w-full max-w-md">
            <div className="text-center m-0 p-0">
              <Text
                variant="label-small"
                className="text-[var(--negative-500)] leading-[16px] m-0 p-0"
              >
                {parseError}
              </Text>
            </div>
            <Button
              variant="primary"
              size="small"
              onClick={handleUploadClick}
            >
              Försök igen
            </Button>
          </div>
        ) : hasTransactions ? (
          // Report View
          <div className="w-full">
            <CustomerLedgerReport transactions={transactions} />
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col gap-[12px] items-center shrink-0 w-[240px]">
            <Illustration type="list" size={48} />
            <div className="text-center m-0 p-0">
              <Text
                variant="label-small"
                className="text-[var(--neutral-500)] leading-[16px] m-0 p-0"
              >
                Vänligen ladda upp en huvudbok för att sammanställa en rapport.
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Publish Report Modal */}
      <PublishReportModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        customerName={customer.name}
        isLoading={isPublishing}
      />
    </div>
  )
}

