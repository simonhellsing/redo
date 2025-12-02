'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  onCancel?: () => void
  onConfirm?: () => void
  cancelLabel?: string
  confirmLabel?: string
  confirmDisabled?: boolean
}

export function ModalFooter({
  onCancel,
  onConfirm,
  cancelLabel = 'Avbryt',
  confirmLabel = 'Lägg till kund',
  confirmDisabled,
  className,
  ...props
}: ModalFooterProps) {
  return (
    <div
      className={cn(
        'bg-[var(--neutral-0)] border-t border-[var(--neutral-100)]',
        'flex gap-[8px] items-center justify-end px-[20px] py-[8px] rounded-b-[12px]',
        className
      )}
      {...props}
    >
      {onCancel && (
        <Button
          variant="tertiary"
          size="small"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      )}
      {onConfirm && (
        <Button
          variant="primary"
          size="small"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </Button>
      )}
    </div>
  )
}

