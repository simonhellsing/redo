'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GlobalNavigation } from '@/components/ui/GlobalNavigation'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { AddCustomerModalProvider, useAddCustomerModal } from '@/components/admin/AddCustomerModalContext'
import { 
  MdOutlineDashboard,
  MdOutlineSettings,
} from 'react-icons/md'

interface Workspace {
  id: string
  name: string
  logo_url?: string | null
}

interface Customer {
  id: string
  name: string
  logo_url?: string | null
}

interface AdminLayoutWithNavigationProps {
  workspace: Workspace
  customers: Customer[]
  userName?: string
  userEmail?: string
  children: React.ReactNode
}

function AdminLayoutWithNavigationContent({ 
  workspace, 
  customers,
  userName,
  userEmail,
  children 
}: AdminLayoutWithNavigationProps) {
  const router = useRouter()
  const pathname = usePathname() || ''
  const { openModal } = useAddCustomerModal()

  const navigationItems = [
    {
      label: 'Översikt',
      icon: <MdOutlineDashboard />,
      active: pathname === '/overview',
      onClick: () => router.push('/overview'),
    },
    {
      label: 'Inställningar',
      icon: <MdOutlineSettings />,
      active: pathname.startsWith('/settings'),
      onClick: () => router.push('/settings/branding'),
    },
  ]

  const customerItems = customers.map((customer) => ({
    name: customer.name,
    logo: customer.logo_url ? (
      <ImageWithFallback
        src={customer.logo_url}
        alt={`${customer.name} logo`}
        className="w-full h-full object-cover"
      />
    ) : undefined,
    active: pathname.startsWith(`/customers/${customer.id}`),
    onClick: () => router.push(`/customers/${customer.id}`),
  }))

  const organizationLogo = workspace.logo_url ? (
    <ImageWithFallback
      src={workspace.logo_url}
      alt={`${workspace.name} logo`}
      className="w-full h-full object-cover rounded-[6px]"
    />
  ) : (
    <div className="w-full h-full bg-[var(--neutral-200)] rounded-[6px]" />
  )

  return (
    <div className="w-full h-screen overflow-hidden bg-[#ffffff] flex items-start justify-between">
      {/* Global Navigation */}
      <div className="bg-[var(--neutral-50)] flex flex-col gap-[16px] h-full items-start shrink-0 overflow-y-auto">
        <GlobalNavigation
          organizationName={workspace.name}
          organizationLogo={organizationLogo}
          navigationItems={navigationItems}
          customers={customerItems}
          userName={userName}
          userEmail={userEmail}
          onNotificationClick={() => console.log('Notifications clicked')}
          onAddCustomerClick={openModal}
        />
      </div>

      {/* Main Content */}
      <div className="basis-0 flex flex-col gap-[8px] grow h-full items-start min-h-px min-w-px p-[8px] shrink-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function AdminLayoutWithNavigation({ 
  workspace, 
  customers,
  userName,
  userEmail,
  children 
}: AdminLayoutWithNavigationProps) {
  const router = useRouter()

  return (
    <AddCustomerModalProvider
      workspaceId={workspace.id}
      onSuccess={() => {
        router.refresh()
      }}
    >
      <AdminLayoutWithNavigationContent
        workspace={workspace}
        customers={customers}
        userName={userName}
        userEmail={userEmail}
      >
        {children}
      </AdminLayoutWithNavigationContent>
    </AddCustomerModalProvider>
  )
}

