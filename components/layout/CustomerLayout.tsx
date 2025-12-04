'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GlobalNavigation } from '@/components/ui/GlobalNavigation'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { 
  MdOutlineChromeReaderMode,
  MdOutlineCalculate,
} from 'react-icons/md'

interface CustomerLayoutProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  workspaceName?: string
  workspaceLogo?: string | null
}

export function CustomerLayout({ 
  children,
  userName,
  userEmail,
  workspaceName = 'Redo',
  workspaceLogo,
}: CustomerLayoutProps) {
  const router = useRouter()
  const pathname = usePathname() || ''

  const navigationItems = [
    {
      label: 'Rapport',
      icon: <MdOutlineChromeReaderMode />,
      active: pathname === '/my-reports' || pathname.startsWith('/reports/'),
      onClick: () => router.push('/my-reports'),
    },
    {
      label: 'Simuleringar',
      icon: <MdOutlineCalculate />,
      active: pathname.startsWith('/simulations'),
      onClick: () => router.push('/simulations'),
    },
  ]

  const organizationLogo = workspaceLogo ? (
    <ImageWithFallback
      src={workspaceLogo}
      alt={`${workspaceName} logo`}
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
          organizationName={workspaceName}
          organizationLogo={organizationLogo}
          className="w-[220px]"
          navigationItems={navigationItems}
          customers={[]}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* Main Content */}
      <div className="basis-0 flex flex-col gap-[8px] grow h-full items-start min-h-px min-w-px p-[8px] shrink-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

