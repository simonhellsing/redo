'use client'

import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface PublishReportModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  customerName: string
  isLoading?: boolean
}

export function PublishReportModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  isLoading = false,
}: PublishReportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={cn(
          'bg-[var(--neutral-0)] flex flex-col rounded-[12px] overflow-hidden',
          'shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)]'
        )}
        style={{
          width: '400px',
        }}
      >
        {/* Content */}
        <div className="flex flex-col gap-[12px] items-start px-[20px] py-[32px] w-full">
          <Text
            variant="title-small"
            className="text-[var(--neutral-800)]"
            style={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              letterSpacing: '0.15px',
            }}
          >
            Är du säker på att du vill publicera rapporten för {customerName}?
          </Text>
          <Text
            variant="body-small"
            className="text-[var(--neutral-600)]"
            style={{
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
              letterSpacing: '0.25px',
            }}
          >
            När rapporten är publicerad kommer kundanvändare att kunna se den. Om kunden har en kontakt-e-postadress kommer en inbjudan att skickas automatiskt.
          </Text>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--neutral-100)] flex items-center justify-end px-[12px] py-[8px] w-full">
          <div className="flex gap-[8px] items-center">
            <Button
              variant="tertiary"
              size="small"
              onClick={onClose}
              style={{
                height: '32px',
                padding: '10px 12px',
                borderRadius: '8px',
              }}
            >
              Avbryt
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                !isLoading && '!bg-[var(--positive-500)]'
              )}
              style={{
                height: '32px',
                padding: '10px 12px',
                borderRadius: '8px',
              }}
            >
              {isLoading ? 'Publicerar...' : 'Publicera'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

