'use client'

import { Modal } from '@/components/ui/Modal'
import { Text } from '@/components/ui/Text'

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
      <Modal
        title="Publicera rapport"
        onClose={onClose}
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmLabel={isLoading ? 'Publicerar...' : 'Publicera'}
        confirmDisabled={isLoading}
        cancelLabel="Avbryt"
      >
        <div className="flex flex-col gap-[16px] w-full">
          <Text variant="body-medium" className="text-[var(--neutral-700)]">
            Är du säker på att du vill publicera rapporten för {customerName}?
          </Text>
          <Text variant="body-small" className="text-[var(--neutral-500)]">
            När rapporten är publicerad kommer kundanvändare att kunna se den. Om kunden har en kontakt-e-postadress kommer en inbjudan att skickas automatiskt.
          </Text>
        </div>
      </Modal>
    </div>
  )
}

