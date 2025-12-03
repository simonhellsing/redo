'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Text } from '@/components/ui/Text'
import { QuickAction } from '@/components/ui/QuickAction'
import { QuickActionDropdown } from '@/components/ui/QuickActionDropdown'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Table } from '@/components/ui/Table'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { useAddCustomerModal } from '@/components/admin/AddCustomerModalContext'
import { InviteAdministratorButton } from '@/components/admin/InviteAdministratorButton'
import { UploadCustomerListModal } from '@/components/admin/UploadCustomerListModal'
import { MdOutlineUpload } from 'react-icons/md'

interface Customer {
  id: string
  name: string
  logo_url?: string | null
  org_number?: string | null
  hasPublishedReport?: boolean
  hasSourceDocument?: boolean
}

interface DashboardContentProps {
  userName: string
  customers: Customer[]
  workspaceId: string
}

export function DashboardContent({ userName, customers, workspaceId }: DashboardContentProps) {
  const router = useRouter()
  const { openModal } = useAddCustomerModal()
  const [showInviteAdminModal, setShowInviteAdminModal] = useState(false)
  const [showUploadCustomerListModal, setShowUploadCustomerListModal] = useState(false)
  const uploadFileInputRef = useRef<HTMLInputElement>(null)

  const tableColumns = [
    { label: 'Namn', width: '300px' },
    { label: 'Org. nummer', width: '120px' },
    { label: 'Huvudbok', width: '120px' },
    { label: 'Publicerad', width: '120px' },
  ]

  const tableRows = customers.map((customer) => ({
    heroLabel: customer.name,
    heroImageUrl: customer.logo_url || undefined,
    defaultLabel: customer.org_number || '-',
    tag1Label: customer.hasSourceDocument ? 'Uppladdad' : 'Ej uppladdad',
    tag1Variant: customer.hasSourceDocument ? ('prominent' as const) : ('default' as const),
    tag1Icon: customer.hasSourceDocument ? <MdOutlineUpload style={{ width: '16px', height: '16px' }} /> : undefined,
    tag2Label: customer.hasPublishedReport ? 'Publicerad' : 'Ej publicerad',
    tag2Variant: customer.hasPublishedReport ? ('positive' as const) : ('default' as const),
    actionLabel: 'Visa kund',
    onActionClick: () => router.push(`/customers/${customer.id}`),
  }))

  return (
    <div className="flex flex-col gap-[40px] items-start px-[8%] py-[40px] shrink-0 w-full">
      {/* Welcome Section */}
      <div className="flex flex-col gap-[40px] items-start rounded-[12px] shrink-0 w-full">
        <Text
          variant="title-large"
          className="text-black w-full"
          style={{
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '32px',
          }}
        >
          Välkommen tillbaka, {userName}!
        </Text>
        <div className="flex gap-[20px] items-start shrink-0 w-full relative">
          <div className="flex-1 relative">
            <QuickActionDropdown
              illustrationType="card"
              label="Lägg till en ny kund"
              menuItems={[
                {
                  label: 'Lägg till en ny kund',
                  onClick: openModal,
                },
                {
                  label: 'Ladda upp kundlista',
                  onClick: () => {
                    // Open file picker immediately
                    uploadFileInputRef.current?.click()
                  },
                },
              ]}
            />
          </div>
          <QuickAction
            illustrationType="binder"
            label="Ladda upp en huvudbok"
            onClick={() => console.log('Upload ledger clicked')}
            className="flex-1"
          />
          <QuickAction
            illustrationType="list"
            label="Publicera en rapport"
            onClick={() => console.log('Publish report clicked')}
            className="flex-1"
          />
          <QuickAction
            illustrationType="card"
            label="Bjud in administratör"
            onClick={() => setShowInviteAdminModal(true)}
            className="flex-1"
          />
        </div>
        {showInviteAdminModal && (
          <InviteAdministratorButton onClose={() => setShowInviteAdminModal(false)} />
        )}
        <input
          ref={uploadFileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setShowUploadCustomerListModal(true)
            }
          }}
        />
        {showUploadCustomerListModal && (
          <UploadCustomerListModal
            isOpen={showUploadCustomerListModal}
            onClose={() => {
              setShowUploadCustomerListModal(false)
              if (uploadFileInputRef.current) {
                uploadFileInputRef.current.value = ''
              }
            }}
            workspaceId={workspaceId}
            onSuccess={() => {
              router.refresh()
            }}
            initialFile={uploadFileInputRef.current?.files?.[0] || null}
          />
        )}
      </div>

      {/* Customers Section */}
      <div className="flex flex-col gap-[8px] items-start shrink-0 w-full">
        <SectionHeader
          title="Alla kunder"
          onSearchClick={() => console.log('Search clicked')}
          onFilterClick={() => console.log('Filter clicked')}
          className="w-full"
        />
        <div className="flex flex-col gap-[8px] items-start shrink-0 w-full">
          <Table
            columns={tableColumns}
            rows={tableRows}
            currentPage={1}
            totalPages={1}
            onPageChange={(page) => console.log('Page changed to', page)}
            onPreviousPage={() => console.log('Previous page')}
            onNextPage={() => console.log('Next page')}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

