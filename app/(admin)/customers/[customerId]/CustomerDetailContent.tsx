'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Divider } from '@/components/ui/Divider'
import { Button } from '@/components/ui/Button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Illustration } from '@/components/ui/Illustration'
import { Text } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { SourceDocumentUploadForm } from '@/components/admin/SourceDocumentUploadForm'
import { CustomerLedgerReport } from '@/components/admin/CustomerLedgerReport'
import { InviteCustomerUserButton } from '@/components/admin/InviteCustomerUserButton'
import { PublishReportModal } from '@/components/admin/PublishReportModal'
import { useAddCustomerModal } from '@/components/admin/AddCustomerModalContext'
import { IconButton } from '@/components/ui/IconButton'
import { Menu, MenuItem } from '@/components/ui/Menu'
import { Tag } from '@/components/ui/Tag'
import { parseHuvudbokCsv, Transaction } from '@/lib/huvudbok/parseHuvudbokCsv'
import { MdOutlineUpload, MdOutlinePublish, MdOutlineMoreHoriz, MdOutlineCheckCircle, MdOutlineCalendarToday, MdOutlineInfo, MdOutlineErrorOutline, MdOutlineVisibility } from 'react-icons/md'
import type { Customer } from '@/lib/types/customer'

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
  const { openEditModal } = useAddCustomerModal()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
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

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false)
      }
    }

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showMoreMenu])

  const handleEditCustomer = () => {
    openEditModal({
      ...customer,
      workspace_id: workspaceId,
      status: (customer.status as 'Aktiv' | 'Passiv') || 'Aktiv',
    })
    setShowMoreMenu(false)
  }

  const handleDeleteCustomer = async () => {
    if (!confirm(`Är du säker på att du vill radera kunden "${customer.name}"? Denna åtgärd kan inte ångras.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Kunde inte radera kunden')
      }

      // Redirect to overview page after successful deletion
      router.push('/overview')
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert(error instanceof Error ? error.message : 'Kunde inte radera kunden. Försök igen.')
    } finally {
      setIsDeleting(false)
      setShowMoreMenu(false)
    }
  }

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
  const isPublishDisabled = !latestReport || latestReport.status === 'published'
  const canPreview = !!latestReport && latestReport.status === 'published'

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

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {/* PageHeader */}
      <PageHeader
        logo={customerLogo}
        title={customer.name}
        subtitle={
          customer.org_number ? (
            <Text
              variant="label-small"
              className="text-[var(--neutral-500)] whitespace-nowrap"
            >
              {customer.org_number}
            </Text>
          ) : undefined
        }
        actions={
          <>
            <div className="relative">
              <IconButton
                ref={moreButtonRef}
                variant="tertiary"
                size="medium"
                icon={<MdOutlineMoreHoriz />}
                aria-label="Mer alternativ"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              />
              {showMoreMenu && (
                <div
                  ref={moreMenuRef}
                  className="absolute right-0 top-full mt-[4px] z-50 min-w-[180px]"
                >
                  <Menu>
                    <MenuItem onClick={handleEditCustomer}>
                      Redigera kund
                    </MenuItem>
                    <MenuItem onClick={handleDeleteCustomer} disabled={isDeleting}>
                      {isDeleting ? 'Raderar...' : 'Radera kund'}
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
            <InviteCustomerUserButton customerId={customer.id} customerName={customer.name} />
            <div className="bg-[var(--neutral-200)] w-px h-[24px]" />
            <Button
              variant={hasSourceDocuments ? "secondary" : "primary"}
              size="small"
              leftIcon={<MdOutlineUpload />}
              onClick={handleUploadClick}
              disabled={isParsing}
            >
              {isParsing ? 'Laddar...' : hasSourceDocuments ? 'Uppdatera huvudbok' : 'Ladda upp huvudbok'}
            </Button>
            {canPreview && latestReport && (
              <Button
                variant="secondary"
                size="small"
                leftIcon={<MdOutlineVisibility />}
                onClick={() =>
                  router.push(`/customers/${customer.id}/reports/${latestReport.id}/preview`)
                }
              >
                Förhandsgranska
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              leftIcon={<MdOutlinePublish />}
              onClick={() => setShowPublishModal(true)}
              disabled={isPublishDisabled || isPublishing}
            >
              Publicera
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
            <Spinner size="xl" style={{ color: 'var(--brand-primary)' }} />
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
          <div className="w-full flex flex-col gap-[32px]">
            {/* Status Tags */}
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
              {latestReport && (
                <Tag
                  variant={latestReport.status === 'published' ? 'positive' : 'default'}
                  icon={
                    latestReport.status === 'published' ? (
                      <MdOutlineCheckCircle style={{ width: '14px', height: '14px' }} />
                    ) : (
                      <MdOutlineErrorOutline style={{ width: '14px', height: '14px' }} />
                    )
                  }
                >
                  {latestReport.status === 'published' ? 'Publicerad' : 'Ej publicerad'}
                </Tag>
              )}
            </div>
            <CustomerLedgerReport transactions={transactions} />
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col gap-[12px] items-center shrink-0 w-[240px]">
            <Illustration type="list" size={48} />
            <div className="text-center m-0 p-0">
              <Text
                variant="label-small"
                className="text-[var(--neutral-500)] m-0 p-0"
                style={{
                  lineHeight: '16px',
                  display: 'inline-block',
                }}
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

