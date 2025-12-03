'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Text } from '@/components/ui/Text'
import { QuickAction } from '@/components/ui/QuickAction'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Table } from '@/components/ui/Table'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { useAddCustomerModal } from '@/components/admin/AddCustomerModalContext'
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
}

export function DashboardContent({ userName, customers }: DashboardContentProps) {
  const router = useRouter()
  const { openModal } = useAddCustomerModal()

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
      <div className="flex flex-col gap-[20px] items-center rounded-[12px] shrink-0 w-[912px]">
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
        <div className="flex gap-[20px] items-start shrink-0 w-full">
          <QuickAction
            illustrationType="card"
            label="Lägg till ny kund"
            onClick={openModal}
          />
          <QuickAction
            illustrationType="binder"
            label="Ladda upp en huvudbok"
            onClick={() => console.log('Upload ledger clicked')}
          />
          <QuickAction
            illustrationType="list"
            label="Publicera en rapport"
            onClick={() => console.log('Publish report clicked')}
          />
        </div>
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

