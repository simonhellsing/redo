'use client'

import { PageHeader } from '@/components/ui/PageHeader'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Button } from '@/components/ui/Button'

interface CustomerReportHeaderProps {
  customerName: string
  orgNumber?: string | null
  logoUrl?: string | null
  disableDownload?: boolean
}

export function CustomerReportHeader({
  customerName,
  orgNumber,
  logoUrl,
  disableDownload,
}: CustomerReportHeaderProps) {
  const logo = logoUrl ? (
    <ImageWithFallback
      src={logoUrl}
      alt={`${customerName} logo`}
      className="w-full h-full object-cover rounded-[8px]"
    />
  ) : (
    <div className="w-full h-full bg-[var(--neutral-200)] rounded-[8px]" />
  )

  return (
    <PageHeader
      title={customerName}
      subtitle={orgNumber || undefined}
      logo={logo}
      actions={
        <Button
          variant="primary"
          size="small"
          disabled={disableDownload}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.print()
            }
          }}
        >
          Ladda ned
        </Button>
      }
    />
  )
}


